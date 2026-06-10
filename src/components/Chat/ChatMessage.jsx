import React, { useState, useEffect } from 'react';

export default function ChatMessage({ message, isUndoable, onUndo, onSwitchMode, onResendInMode, onDismissSuggestion, onResendClarification }) {
  const isUser = message.role === 'user';
  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = (e) => {
    if (isUser) {
      const isUndone = message.extractedData?.is_undone;
      
      // Allow undo only if the parent passed isUndoable
      if (isUndoable && !isUndone) {
        e.preventDefault();
        setContextMenu({ x: e.pageX, y: e.pageY });
      }
    }
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenu]);

  // Handle User Message
  if (isUser) {
    const isCommand = message.content.startsWith('/');
    const isUndone = message.extractedData?.is_undone;
    
    return (
      <>
        <div onContextMenu={handleContextMenu} className="animate-slide-right" style={{
          alignSelf: 'flex-end',
          background: isUndone ? 'transparent' : 'var(--bg-surface-elevated)',
          border: isUndone ? '1px dashed var(--text-tertiary)' : 'none',
          borderLeft: isUndone ? 'none' : `2px solid ${isCommand ? 'var(--danger)' : 'var(--accent)'}`,
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          borderBottomRightRadius: '3px',
          maxWidth: '85%',
          lineHeight: '1.6',
          fontSize: '0.9rem',
          color: isUndone ? 'var(--text-tertiary)' : (isCommand ? 'var(--danger)' : 'var(--text-primary)'),
          fontFamily: isCommand ? 'var(--font-mono)' : 'var(--font-body)',
          textDecoration: isUndone ? 'line-through' : 'none',
          opacity: isUndone ? 0.6 : 1,
          position: 'relative',
          cursor: (isUndoable && !isUndone) ? 'context-menu' : 'default'
        }}>
          {isUndone && (
            <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--bg-base)', border: '1px solid var(--text-tertiary)', color: 'var(--text-secondary)', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '4px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Undone</span>
          )}
          {message.content}
        </div>

        {contextMenu && (
          <div style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--glass-border)',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 100
          }}>
            <button onClick={() => onUndo(message.entryId, message.extractedData)} style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--danger)',
              padding: '0.4rem 0.8rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'background 0.2s'
            }} onMouseOver={e => e.currentTarget.style.background = 'rgba(139, 58, 58, 0.1)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
              Undo Action
            </button>
          </div>
        )}
      </>
    );
  }

  // Helper to render extracted data correctly based on Intent Routing
  const renderExtractedData = (data) => {
    if (!data) return null;

    const intent = data.intent;

    if (intent === 'CLARIFY') {
      return (
        <div className="animate-fade-up" style={{
          background: 'linear-gradient(135deg, rgba(201,153,42,0.08), rgba(201,153,42,0.03))',
          border: '1px solid rgba(201,153,42,0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>{data.message}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onResendClarification && onResendClarification("FORCE MULTI:", message.originalText || message.content)}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-body)'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Log as multiple records
            </button>
            <button
              onClick={() => onResendClarification && onResendClarification("FORCE SINGLE:", message.originalText || message.content)}
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--glass-border)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-body)'
              }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--glass-border-hover)' }}
              onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--glass-border)' }}
            >
              Log as one summary
            </button>
          </div>
        </div>
      );
    }

    if (intent === 'MODE_SUGGESTION') {
      return (
        <div className="animate-fade-up" style={{
          background: 'linear-gradient(135deg, rgba(201,153,42,0.08), rgba(201,153,42,0.03))',
          border: '1px solid rgba(201,153,42,0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>{data.message}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onResendInMode && onResendInMode(message.id, message.originalUserMsgId, message.originalText, data.suggested_mode)}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-body)'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Switch to {data.suggested_mode === 'build' ? 'Build' : 'Consult'} Mode
            </button>
            <button
              onClick={() => onDismissSuggestion && onDismissSuggestion(message.id)}
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--glass-border)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-body)'
              }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--glass-border-hover)' }}
              onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--glass-border)' }}
            >
              No, continue here
            </button>
          </div>
        </div>
      );
    }

    if (intent === 'USAGE_LIMIT') {
      return (
        <div className="animate-fade-up" style={{
          background: 'linear-gradient(135deg, rgba(201,153,42,0.1), rgba(201,153,42,0.05))',
          border: '1px solid rgba(201,153,42,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>Usage Limit Reached</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>{data.message}</span>
        </div>
      );
    }

    if (intent === 'CONVERSATION' || intent === 'VISUALIZATION_REQUEST' || intent === 'UNDO_ACTION' || intent === 'GENERATE_INSIGHTS') {
      return <p style={{ fontSize: '0.925rem', color: 'var(--text-primary)' }}>{data.response || data.message}</p>;
    }

    if (intent === 'UNSUPPORTED_REQUEST') {
      return (
        <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          <p style={{ fontSize: '0.925rem', margin: 0 }}>{data.message}</p>
        </div>
      );
    }

    if (intent === 'DATA_COMMAND') {
      return (
        <div style={{ background: 'var(--bg-base)', border: '1px solid rgba(139, 58, 58, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.875rem' }}>
          <p style={{ color: 'var(--danger)', fontVariant: 'small-caps', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ✓ Done
          </p>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', gap: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Action:</span> <span>{data.action}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Target:</span> <span>{data.target}</span>
          </div>
        </div>
      );
    }

    if (intent === 'LOG_DATA_MULTI') {
      return (
        <div>
          <p style={{ fontSize: '0.8rem', marginBottom: '0.75rem', color: 'var(--text-tertiary)', fontVariant: 'small-caps', letterSpacing: '0.05em', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ✓ Logged {data.multi_count} entries
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {data.entries.map((entry, idx) => (
              <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                {Object.entries(entry).filter(([k]) => k !== 'intent' && k !== 'is_undone').map(([key, value]) => (
                  <span key={key} style={{
                    background: 'var(--accent-dim)',
                    border: '1px solid rgba(201, 153, 42, 0.25)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>{key}</span>
                    <span style={{ color: 'var(--text-tertiary)', opacity: 0.5 }}>·</span>
                    <span style={{ fontWeight: '500', color: 'var(--accent)' }}>{String(value)}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default: LOG_DATA or legacy data (which has no intent key)
    const entities = intent === 'LOG_DATA' ? data.entities : data;
    
    // Prevent rendering if entities is somehow a string or missing
    if (typeof entities !== 'object' || entities === null) return null;

    return (
      <div>
        <p style={{ fontSize: '0.8rem', marginBottom: '0.75rem', color: 'var(--text-tertiary)', fontVariant: 'small-caps', letterSpacing: '0.05em', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ✓ Logged
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {Object.entries(entities).filter(([k]) => k !== 'intent' && k !== 'is_undone').map(([key, value]) => {
            const bgTint = 'var(--accent-dim)';
            const borderColor = 'rgba(201, 153, 42, 0.25)';
            const valueColor = 'var(--accent)';

            return (
              <span key={key} style={{
                background: bgTint,
                border: `1px solid ${borderColor}`,
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontFamily: 'var(--font-mono)'
              }}>
                <span style={{ color: 'var(--text-tertiary)' }}>{key}</span>
                <span style={{ color: 'var(--text-tertiary)', opacity: 0.5 }}>·</span>
                <span style={{ fontWeight: '500', color: valueColor }}>{String(value)}</span>
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  // System Message
  return (
    <div className="animate-slide-left" style={{
      alignSelf: 'flex-start',
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderLeft: '2px solid var(--text-tertiary)',
      padding: '0.875rem 1.25rem',
      borderRadius: 'var(--radius-md)',
      borderBottomLeftRadius: '3px',
      maxWidth: '90%',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      opacity: message.extractedData?.is_undone ? 0.6 : 1
    }}>
      {message.content && <p style={{ fontSize: '0.925rem', marginBottom: message.extractedData ? '1rem' : '0' }}>{message.content}</p>}
      {renderExtractedData(message.extractedData)}
    </div>
  );
}
