import React from 'react';

export default function KeyInsightsPanel({ insights, loading, hasData }) {
  if (!hasData) return null;

  return (
    <div className="glass" style={{
      background: 'var(--bg-surface-elevated)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-xl)',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginTop: '1rem',
      marginBottom: '2rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 600 }}>Key Insights</h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>AI-generated from your data</p>
        </div>
        <div style={{ padding: '0.4rem', background: 'var(--accent-dim)', borderRadius: '50%', color: 'var(--accent)', display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
        </div>
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        {loading || !insights ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div className="animate-pulse" style={{ height: '16px', background: 'var(--glass-border)', borderRadius: '4px', width: '80%' }}></div>
            <div className="animate-pulse" style={{ height: '16px', background: 'var(--glass-border)', borderRadius: '4px', width: '90%' }}></div>
            <div className="animate-pulse" style={{ height: '16px', background: 'var(--glass-border)', borderRadius: '4px', width: '75%' }}></div>
          </div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {insights.split('•').map(line => line.trim()).filter(Boolean).map((insight, idx) => (
              <li key={idx} style={{ paddingLeft: '0.5rem' }}>
                <span style={{ color: 'var(--text-primary)' }}>{insight}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
