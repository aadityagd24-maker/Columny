import React, { useState } from 'react';
import { useDashboards } from '../../hooks/useDashboards';
import { useProfile } from '../../hooks/useProfile';
import CreateDashboardModal from './CreateDashboardModal';
import EditDashboardModal from './EditDashboardModal';
import ConfirmModal from '../common/ConfirmModal';
import { useUndo } from '../../context/UndoContext';

export default function HomePage({ onSelectDashboard, onNavigateProfile }) {
  const { dashboards, loading, deleteDashboard } = useDashboards();
  const { profile } = useProfile();
  const { triggerDeferredDelete } = useUndo();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deletingDashboard, setDeletingDashboard] = useState(null);
  const [hiddenDashboards, setHiddenDashboards] = useState([]);

  React.useEffect(() => {
    const handleClick = () => setOpenMenuId(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)' }}>Loading...</div>;
  }

  const confirmDelete = (dashboard) => {
    setDeletingDashboard(null);
    triggerDeferredDelete(
      `Deleted "${dashboard.name}"`,
      () => setHiddenDashboards(prev => [...prev, dashboard.id]), // local commit
      async () => await deleteDashboard(dashboard.id),            // backend execute
      () => setHiddenDashboards(prev => prev.filter(id => id !== dashboard.id)) // local undo
    );
  };

  return (
    <div style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
            {profile?.is_owner && <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Owner</span>}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Your AI-powered workspace</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {!profile?.is_owner && (
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{dashboards.length}/3</span> Dashboards Used
            </div>
          )}
          <button 
            onClick={onNavigateProfile}
            style={{ 
              width: '45px', height: '45px', 
              borderRadius: '50%', 
              background: 'var(--bg-surface-elevated)', 
              border: '1px solid var(--glass-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 0.2s',
              boxShadow: 'var(--glass-shadow)'
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Create Card */}
        <div 
          onClick={() => setShowCreateModal(true)}
          className="glass"
          style={{ 
            height: '220px', 
            borderRadius: 'var(--radius-xl)', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '1rem',
            cursor: 'pointer',
            borderStyle: 'dashed',
            transition: 'all 0.3s ease',
            color: 'var(--text-secondary)'
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = 'var(--glass-border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>New Dashboard</span>
        </div>

        {/* Existing Dashboards */}
        {dashboards.filter(d => !hiddenDashboards.includes(d.id)).map(dashboard => (
          <div 
            key={dashboard.id}
            onClick={() => onSelectDashboard(dashboard.id)}
            className="glass animate-fade-up"
            style={{ 
              height: '220px', 
              borderRadius: 'var(--radius-xl)', 
              padding: '1.5rem',
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = 'var(--glass-border-hover)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === dashboard.id ? null : dashboard.id);
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-surface-elevated)' }}
                onMouseOut={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </button>

              {openMenuId === dashboard.id && (
                <div style={{
                  position: 'absolute', top: '100%', right: '0',
                  background: 'var(--bg-surface-elevated)', border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)', padding: '0.4rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10,
                  display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '140px'
                }}>
                  <button onClick={(e) => { e.stopPropagation(); setEditingDashboard(dashboard); setOpenMenuId(null); }} style={{ textAlign: 'left', background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.5rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-base)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    Edit Settings
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setDeletingDashboard(dashboard); }} style={{ textAlign: 'left', background: 'transparent', border: 'none', color: 'var(--danger)', padding: '0.5rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(139, 58, 58, 0.1)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    Delete Dashboard
                  </button>
                </div>
              )}
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', paddingRight: '2rem' }}>{dashboard.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
              {dashboard.description || dashboard.context}
            </p>
            
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
              <span>Created {new Date(dashboard.created_at).toLocaleDateString()}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent)' }}>
                Open <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </span>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateDashboardModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newDashboard) => {
            setShowCreateModal(false);
            onSelectDashboard(newDashboard.id);
          }}
        />
      )}

      {editingDashboard && (
        <EditDashboardModal 
          dashboard={editingDashboard}
          onClose={() => setEditingDashboard(null)}
          onSuccess={() => {
            setEditingDashboard(null);
          }}
        />
      )}

      {deletingDashboard && (
        <ConfirmModal 
          title="Delete Dashboard"
          message={`Are you sure you want to delete "${deletingDashboard.name}"? All associated logged data and schema will be lost.`}
          confirmText="Delete Dashboard"
          onConfirm={() => confirmDelete(deletingDashboard)}
          onCancel={() => setDeletingDashboard(null)}
        />
      )}

      {/* Beta Watermark */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', pointerEvents: 'none' }}>
        COLUMNY <span style={{ padding: '0.2rem 0.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>β BETA</span>
      </div>
    </div>
  );
}
