import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

const ChatInput = forwardRef(function ChatInput({ onSend, disabled }, ref) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const [activeMode, setActiveMode] = useState(() => {
    return localStorage.getItem('columny_mode') || 'build';
  });

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    localStorage.setItem('columny_mode', mode);
  };

  useImperativeHandle(ref, () => ({
    switchMode: handleModeChange
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim(), activeMode);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const activeColor = 'var(--accent)';
  const activeGlow = 'var(--accent-glow)';

  return (
    <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', background: 'transparent' }}>
      {/* Mode Toggle Tabs */}
      <div style={{
        display: 'inline-flex',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '0.75rem',
        marginLeft: '0.5rem',
        padding: '0.25rem',
        fontFamily: 'var(--font-body)',
        fontSize: '0.8rem',
        fontWeight: '500'
      }}>
        <button
          type="button"
          onClick={() => handleModeChange('consult')}
          style={{
            padding: '0.4rem 1rem',
            background: activeMode === 'consult' ? 'var(--bg-surface)' : 'transparent',
            color: activeMode === 'consult' ? 'var(--accent)' : 'var(--text-secondary)',
            border: activeMode === 'consult' ? '1px solid var(--glass-border-hover)' : '1px solid transparent',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Consult Mode
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('build')}
          style={{
            padding: '0.4rem 1rem',
            background: activeMode === 'build' ? 'var(--bg-surface)' : 'transparent',
            color: activeMode === 'build' ? 'var(--accent)' : 'var(--text-secondary)',
            border: activeMode === 'build' ? '1px solid var(--glass-border-hover)' : '1px solid transparent',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
          Build Mode
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '1rem',
          bottom: '1rem',
          color: isFocused ? activeColor : 'var(--text-tertiary)',
          transition: 'color 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          {activeMode === 'build' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          )}
        </div>
        <textarea 
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={disabled}
          placeholder={activeMode === 'build' ? "Type what happened..." : "Ask me anything..."}
          rows={1}
          style={{
            width: '100%',
            padding: '0.85rem 3.5rem 0.85rem 3rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface-elevated)',
            border: `1px solid ${isFocused ? activeColor : 'var(--glass-border)'}`,
            boxShadow: isFocused ? `0 0 0 2px ${activeGlow}` : '0 2px 8px rgba(0,0,0,0.25)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            resize: 'none',
            overflowY: 'auto',
            minHeight: '48px',
            lineHeight: '1.4'
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <button 
          type="submit"
          disabled={disabled || !input.trim()}
          style={{
            position: 'absolute',
            right: '0.5rem',
            bottom: '0.45rem',
            background: disabled || !input.trim() ? 'var(--bg-surface)' : activeColor,
            color: disabled || !input.trim() ? 'var(--text-tertiary)' : 'white',
            border: '1px solid',
            borderColor: disabled || !input.trim() ? 'var(--glass-border)' : 'transparent',
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-md)',
            cursor: disabled || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: disabled || !input.trim() ? 'none' : `0 2px 8px ${activeGlow}`
          }}
          onMouseOver={e => { if(!disabled && input.trim()) e.currentTarget.style.transform = 'scale(1.05)' }}
          onMouseOut={e => { if(!disabled && input.trim()) e.currentTarget.style.transform = 'scale(1)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    </div>
  );
});

export default ChatInput;
