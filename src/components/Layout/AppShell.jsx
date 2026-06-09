import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ChatPanel from '../Chat/ChatPanel';
import DashboardPanel from '../Dashboard/DashboardPanel';
import { useDashboards } from '../../hooks/useDashboards';
import { useProfile } from '../../hooks/useProfile';

export default function AppShell({ onNavigateHome, onNavigateProfile, dashboardId }) {
  const [userEmail, setUserEmail] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);
  const { dashboards } = useDashboards();
  const { profile } = useProfile();

  const currentDashboard = dashboards.find(d => d.id === dashboardId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email || '');
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        setChatVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="app-shell">
      {/* Top Navigation */}
      <header style={{
        padding: '0.875rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--glass-border)',
        background: 'rgba(12, 12, 10, 0.75)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={onNavigateHome}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-tertiary)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-surface-elevated)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '1.35rem',
              fontWeight: 600,
              letterSpacing: '0.01em',
              color: 'var(--text-primary)'
            }}>Columny</span>
            <span style={{ width: '1px', height: '14px', background: 'var(--glass-border)', display: 'inline-block', verticalAlign: 'middle' }}></span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{currentDashboard?.name || 'Loading...'}</span>
          </div>

          <span style={{ padding: '0.15rem 0.4rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', color: 'var(--text-tertiary)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em' }}>β BETA</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Connection Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulseAccent 3s ease-in-out infinite' }}></span>
            Connected
          </div>

          {/* User email + Avatar Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', position: 'relative' }}>
            <span style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              maxWidth: '160px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>{profile?.full_name || userEmail}</span>

            {/* Avatar button */}
            <button
              onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), rgba(201,153,42,0.5))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#fff',
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              {(profile?.full_name || userEmail || '?')[0]}
            </button>

            {/* Avatar dropdown menu */}
            {showLogoutConfirm && (
              <div className="animate-fade-up" style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '0.5rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                minWidth: '180px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                zIndex: 50,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '0.25rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{profile?.full_name || 'User'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userEmail}</div>
                </div>
                
                <button 
                  onClick={() => { setShowLogoutConfirm(false); onNavigateProfile(); }} 
                  style={{
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: 'none',
                    padding: '0.6rem 1rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>
                  Profile & Settings
                </button>

                <button 
                  onClick={handleLogout} 
                  style={{
                    background: 'transparent',
                    color: 'var(--danger)',
                    border: 'none',
                    padding: '0.6rem 1rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.25rem'
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(139, 58, 58, 0.1)' }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Grid */}
      <div className="app-grid" style={{
        gridTemplateColumns: chatVisible ? '420px 1fr' : '0px 1fr',
        transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        gap: chatVisible ? '1.25rem' : '0'
      }}>
        <ChatPanel />
        <DashboardPanel chatVisible={chatVisible} setChatVisible={setChatVisible} />
      </div>
    </div>
  );
}
