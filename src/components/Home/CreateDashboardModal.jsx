import React, { useState } from 'react';
import { useDashboards } from '../../hooks/useDashboards';
import { useProfile } from '../../hooks/useProfile';

export default function CreateDashboardModal({ onClose, onSuccess }) {
  const { createDashboard, dashboards } = useDashboards();
  const { profile } = useProfile();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !context) {
      setError('Name and context are required.');
      return;
    }

    if (!profile?.is_owner && dashboards.length >= 3) {
      setError('Beta limit reached: You cannot create more than 3 dashboards.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newDashboard = await createDashboard({ name, description, context });
      onSuccess(newDashboard);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="glass animate-fade-up" style={{ width: '100%', maxWidth: '450px', padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: 0 }}>New Dashboard</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(139, 58, 58, 0.1)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139, 58, 58, 0.3)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dashboard Name *</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', outline: 'none' }}
              placeholder="e.g. Sales Calls"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
            <input 
              type="text" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', outline: 'none' }}
              placeholder="Optional summary"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracking Context *</label>
            <textarea 
              value={context}
              onChange={e => setContext(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)' }}
              placeholder="Give the AI some context about what you'll be logging here..."
            />
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', padding: '0.75rem 1rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              style={{ 
                background: 'var(--accent)', 
                color: 'white', 
                border: 'none', 
                padding: '0.75rem 1.5rem', 
                borderRadius: 'var(--radius-md)', 
                fontWeight: 600, 
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Creating...' : 'Create Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
