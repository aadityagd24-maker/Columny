import React, { createContext, useContext, useState, useEffect } from 'react';

const UndoContext = createContext();

export function useUndo() {
  return useContext(UndoContext);
}

export function UndoProvider({ children }) {
  const [pendingActions, setPendingActions] = useState([]);

  const triggerDeferredDelete = (title, localCommit, backendExecute, localUndo) => {
    // Execute local commit immediately (e.g. remove from UI state)
    localCommit();

    const id = Date.now().toString();
    const newAction = {
      id,
      title,
      progress: 100, // For the visual countdown bar
      timeoutId: null,
      intervalId: null,
      backendExecute,
      localUndo
    };

    // The backend executes after 10 seconds
    const timeoutId = setTimeout(async () => {
      try {
        await backendExecute();
      } catch (err) {
        console.error("Deferred execution failed", err);
      }
      setPendingActions(prev => prev.filter(a => a.id !== id));
    }, 10000);

    // Update progress bar smoothly
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      setPendingActions(prev => prev.map(a => {
        if (a.id === id) {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 10000 - elapsed);
          return { ...a, progress: (remaining / 10000) * 100 };
        }
        return a;
      }));
    }, 50);

    newAction.timeoutId = timeoutId;
    newAction.intervalId = intervalId;

    setPendingActions(prev => [...prev, newAction]);
  };

  const handleUndo = (action) => {
    clearTimeout(action.timeoutId);
    clearInterval(action.intervalId);
    // User requested undo, restore the local state!
    if (action.localUndo) action.localUndo();
    setPendingActions(prev => prev.filter(a => a.id !== action.id));
  };

  const handleDismiss = (action) => {
    clearTimeout(action.timeoutId);
    clearInterval(action.intervalId);
    // Dismissing means we skip the wait and execute immediately
    action.backendExecute();
    setPendingActions(prev => prev.filter(a => a.id !== action.id));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pendingActions.forEach(a => {
        clearTimeout(a.timeoutId);
        clearInterval(a.intervalId);
      });
    };
  }, [pendingActions]);

  return (
    <UndoContext.Provider value={{ triggerDeferredDelete }}>
      {children}
      
      {/* Floating Undo Container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 9999
      }}>
        {pendingActions.map(action => (
          <div key={action.id} className="animate-fade-up glass" style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            minWidth: '320px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '3px',
              background: 'var(--danger)',
              width: `${action.progress}%`,
              transition: 'width 50ms linear'
            }} />
            
            <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              {action.title}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => handleUndo(action)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(201, 153, 42, 0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                UNDO
              </button>
              <button 
                onClick={() => handleDismiss(action)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px',
                  borderRadius: '50%',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-base)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </UndoContext.Provider>
  );
}
