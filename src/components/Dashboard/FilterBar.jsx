import React, { useState } from 'react';

export default function FilterBar({ filterText, setFilterText }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ display: 'flex', gap: '1rem', width: '250px' }}>
      <div style={{ position: 'relative', width: '100%' }}>
        <div style={{
          position: 'absolute',
          left: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: isFocused ? 'var(--accent)' : 'var(--text-tertiary)',
          pointerEvents: 'none',
          display: 'flex',
          transition: 'color 0.2s'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <input 
          type="text" 
          placeholder="Search records..." 
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            padding: '0.5rem 2rem 0.5rem 2.25rem',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${isFocused ? 'var(--accent)' : 'var(--glass-border)'}`,
            boxShadow: isFocused ? '0 0 0 2px var(--accent-glow)' : 'none',
            background: 'var(--bg-base)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            outline: 'none',
            fontSize: '0.85rem',
            transition: 'all 0.2s'
          }}
        />
        {filterText && (
          <button 
            onClick={() => setFilterText('')}
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              padding: '0.25rem'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}
      </div>
    </div>
  );
}
