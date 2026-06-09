import React, { useState, useRef, useEffect } from 'react';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { useSchemaContext } from '../../context/SchemaContext';

export default function ChatPanel() {
  const { dashboardId, entries, refreshData } = useSchemaContext();
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const scrollRef = useRef(null);
  const chatInputRef = useRef(null);

  const handleSwitchMode = (mode) => {
    if (chatInputRef.current) {
      chatInputRef.current.switchMode(mode);
    }
  };

  // Sync database entries to chat history
  useEffect(() => {
    setMessages(prev => {
      // Keep frontend-generated suggestions, errors, and the optimistic user message while processing
      const localMessages = prev.filter(m => {
        if (String(m.id).includes('_user') || String(m.id).includes('_ai')) return false;
        return m.extractedData?.intent === 'MODE_SUGGESTION' || m.extractedData?.intent === 'USAGE_LIMIT' || String(m.content).startsWith('Error:') || isProcessing || String(m.id).includes('_local_kept');
      });

      // Build messages from DB entries, grouping by raw_text for LOG_DATA_MULTI
      const dbMessages = [];
      const reversed = [...entries].reverse();
      const groups = [];

      reversed.forEach(entry => {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup && lastGroup.raw_text === entry.raw_text && Math.abs(new Date(lastGroup.entries[0].created_at) - new Date(entry.created_at)) < 5000) {
          lastGroup.entries.push(entry);
        } else {
          groups.push({ raw_text: entry.raw_text, entries: [entry] });
        }
      });

      groups.forEach(group => {
        // User message (only once per group)
        dbMessages.push({ 
          id: group.entries[0].id + '_user', 
          entryId: group.entries[0].id, 
          role: 'user', 
          content: group.raw_text, 
          extractedData: group.entries[0].extracted_data 
        });

        // AI message (combine multiple if grouped)
        if (group.entries.length > 1) {
          const combinedExtracted = {
            intent: 'LOG_DATA_MULTI',
            multi_count: group.entries.length,
            entries: group.entries.map(e => e.extracted_data.entities || e.extracted_data)
          };
          dbMessages.push({ 
            id: group.entries[0].id + '_ai_multi', 
            entryId: group.entries[0].id, 
            role: 'system', 
            extractedData: combinedExtracted 
          });
        } else {
          dbMessages.push({ 
            id: group.entries[0].id + '_ai', 
            entryId: group.entries[0].id, 
            role: 'system', 
            extractedData: group.entries[0].extracted_data,
            originalText: group.raw_text
          });
        }
      });

      return [...dbMessages, ...localMessages];
    });
  }, [entries, isProcessing]);

  const handleSpecificUndo = async (entryId, extractedData) => {
    const updatedData = { ...(extractedData || {}), is_undone: true };
    const { supabase } = await import('../../lib/supabaseClient');
    await supabase.from('entries').update({ extracted_data: updatedData }).eq('id', entryId);
    await refreshData();
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSend = async (text, mode) => {
    // 1. Frontend Keyword Routing (Zero-Token Mode Detection)
    const lowerText = text.toLowerCase().trim();
    const firstWord = lowerText.split(' ')[0];
    
    let suggestedMode = null;
    let suggestionMessage = '';

    if (mode === 'build') {
      const questionStarters = ['what', 'how', 'why', 'when', 'who', 'where', 'can', 'could', 'should', 'would', 'is', 'are', 'do', 'does', 'did', 'tell'];
      if (questionStarters.includes(firstWord) || lowerText.endsWith('?')) {
        suggestedMode = 'consult';
        suggestionMessage = "It looks like you're asking a question. Would you like to switch to Consult Mode?";
      }
    } else if (mode === 'consult') {
      const actionWords = ['called', 'sent', 'added', 'deleted', 'removed', 'rename', 'log', 'emailed', 'met', 'had', 'update', 'set'];
      if (actionWords.includes(firstWord) || lowerText.startsWith('log ')) {
        suggestedMode = 'build';
        suggestionMessage = "It looks like you're trying to log data or edit the dashboard. Would you like to switch to Build Mode?";
      }
    }

    const userMsgId = Date.now();
    const userMsg = { id: userMsgId, role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);

    if (suggestedMode) {
      // Intercept and show popup instantly WITHOUT hitting API
      const aiMsg = {
        id: Date.now() + 1,
        role: 'system',
        extractedData: {
          intent: 'MODE_SUGGESTION',
          suggested_mode: suggestedMode,
          message: suggestionMessage
        },
        originalText: text,
        originalUserMsgId: userMsgId
      };
      setTimeout(() => setMessages(prev => [...prev, aiMsg]), 300); // Tiny delay for natural feel
      return; // Stop execution here
    }

    setIsProcessing(true);

    try {
      const { supabase } = await import('../../lib/supabaseClient');
      const { data, error } = await supabase.functions.invoke('extract', {
        body: { raw_text: text, mode: mode, dashboard_id: dashboardId }
      });
      
      if (error) {
        throw error;
      }

      if (!data?.data && data?.extracted) {
        // Backend didn't insert to DB, so we manually keep it in local state
        const aiMsg = {
          id: Date.now() + 1 + '_local_kept',
          role: 'system',
          extractedData: data.extracted,
          originalText: text
        };
        setMessages(prev => prev.map(m => m.id === userMsgId ? { ...m, id: userMsgId + '_local_kept' } : m).concat(aiMsg));
      } else {
        await refreshData();
      }

    } catch (err) {
      console.error('Extraction failed:', err);
      
      // Attempt to parse custom Edge Function errors
      let isUsageLimit = false;
      let limitMessage = "You have reached your limit.";
      
      try {
        // Supabase invoke errors usually wrap the Response in context if it was JSON
        if (err.context && err.context.error_type === "USAGE_LIMIT") {
          isUsageLimit = true;
          limitMessage = err.context.message || limitMessage;
        } else if (err.message && err.message.includes("USAGE_LIMIT")) {
          isUsageLimit = true;
        }
      } catch (e) {}

      if (isUsageLimit) {
         setMessages(prev => [...prev, { id: Date.now() + 1 + '_local_kept', role: 'system', extractedData: { intent: 'USAGE_LIMIT', message: limitMessage } }]);
      } else {
         setMessages(prev => [...prev, { id: Date.now() + 1 + '_local_kept', role: 'system', content: `Error: ${err.message}` }]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendInMode = (suggestionMsgId, originalUserMsgId, originalText, newMode) => {
    setMessages(prev => prev.filter(m => m.id !== suggestionMsgId && m.id !== originalUserMsgId));
    handleSwitchMode(newMode);
    setTimeout(() => handleSend(originalText, newMode), 100);
  };

  const handleDismissSuggestion = (suggestionMsgId) => {
    setMessages(prev => prev.filter(m => m.id !== suggestionMsgId));
  };

  const handleResendClarification = (prefix, originalText) => {
    handleSend(`${prefix}\n\n${originalText}`, 'build');
  };

  const handleUndo = async () => {
    if (entries.length === 0) return;
    const latestEntry = entries[0];
    const { supabase } = await import('../../lib/supabaseClient');
    await supabase.from('entries').delete().eq('id', latestEntry.id);
    await refreshData();
  };

  const handleClearChat = async () => {
    const { supabase } = await import('../../lib/supabaseClient');
    await supabase.from('entries').delete().not('id', 'is', null);
    setShowClearConfirm(false);
    await refreshData();
  };

  return (
    <div className="glass chat-panel" style={{ 
      display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-xl)', 
      overflow: 'hidden', position: 'relative',
      boxShadow: 'inset 0 1px 0 rgba(240,235,224,0.04), var(--glass-shadow)',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-surface-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <h2 style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '10px', height: '10px', background: 'var(--accent)', borderRadius: '50%', animation: 'pulseAccent 2s infinite'}}></div>
          Chat
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
          <button onClick={handleUndo} title="Undo Last Entry" style={{ background: 'transparent', border: '1px solid transparent', color: 'var(--text-muted)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}} onMouseOut={e => {e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
          </button>
          
          {showClearConfirm ? (
            <div className="animate-fade-up" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', padding: '0.5rem', display: 'flex', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 20 }}>
              <button onClick={handleClearChat} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Confirm</button>
              <button onClick={() => setShowClearConfirm(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowClearConfirm(true)} title="Clear Chat" style={{ background: 'transparent', border: '1px solid transparent', color: 'var(--text-muted)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(139, 58, 58, 0.1)'}} onMouseOut={e => {e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Scroll Fade Overlay */}
      <div style={{ position: 'absolute', top: '65px', left: 0, right: 0, height: '40px', background: 'linear-gradient(to bottom, rgba(12, 12, 10, 0.8), transparent)', zIndex: 5, pointerEvents: 'none' }}></div>

      {/* Message Area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '48px', height: '1px', background: 'var(--glass-border-hover)', margin: '0 auto 0.5rem' }}></div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Start logging</h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '80%', margin: '0 auto' }}>Type what happened today and the AI will organize it for you.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <button onClick={() => handleSend("Sent intro email to Hans at BMW", "build")} className="glass" style={{ textAlign: 'left', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-primary)'}} onMouseOut={e => {e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'}}>
                "Sent intro email to Hans at BMW"
              </button>
              <button onClick={() => handleSend("Called Sarah at Stripe, she wants a demo", "build")} className="glass" style={{ textAlign: 'left', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-primary)'}} onMouseOut={e => {e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'}}>
                "Called Sarah at Stripe, she wants a demo"
              </button>
            </div>
          </div>
        ) : (
          messages.map(msg => <ChatMessage key={msg.id} message={msg} onUndo={handleSpecificUndo} onSwitchMode={handleSwitchMode} onResendInMode={handleResendInMode} onDismissSuggestion={handleDismissSuggestion} onResendClarification={handleResendClarification} />)
        )}
        
        {isProcessing && (
          <div className="animate-fade-up" style={{ alignSelf: 'flex-start', background: 'var(--bg-surface-elevated)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: 'var(--radius-md)', borderBottomLeftRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="animate-spin" style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }}></span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Let me cook!</span>
          </div>
        )}
      </div>

      <ChatInput ref={chatInputRef} onSend={handleSend} disabled={isProcessing} />
    </div>
  );
}
