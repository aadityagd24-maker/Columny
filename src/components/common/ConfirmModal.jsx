import React from 'react';

export default function ConfirmModal({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, isDanger = true }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="glass animate-fade-up" style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button 
            onClick={onCancel}
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', padding: '0.75rem 1rem', cursor: 'pointer', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            style={{ 
              background: isDanger ? 'var(--danger)' : 'var(--accent)', 
              color: 'white', 
              border: 'none', 
              padding: '0.75rem 1.5rem', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: 600, 
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.opacity = 0.85}
            onMouseOut={e => e.currentTarget.style.opacity = 1}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
