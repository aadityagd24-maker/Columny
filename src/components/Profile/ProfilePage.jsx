import React, { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { supabase } from '../../lib/supabaseClient';

export default function ProfilePage({ onBack }) {
  const { profile, loading, updateProfile } = useProfile();
  
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [companyContext, setCompanyContext] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setOrganization(profile.organization || '');
      setCompanyContext(profile.company_context || '');
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateProfile({
        full_name: fullName,
        organization,
        company_context: companyContext
      });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)' }}>Loading profile...</div>;

  return (
    <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <button 
          onClick={onBack}
          style={{ 
            width: '40px', height: '40px', 
            borderRadius: '50%', 
            background: 'var(--bg-surface-elevated)', 
            border: '1px solid var(--glass-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.2rem' }}>Profile & Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your account and AI context.</p>
        </div>
      </div>

      <div className="glass animate-fade-up" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
        
        {/* Account Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>Account Type</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {profile?.is_owner ? 'Unrestricted access.' : 'Beta Tester. Limited to 3 dashboards and 10 messages per 12 hours.'}
            </p>
          </div>
          <div>
            <span style={{ 
              padding: '0.4rem 1rem', 
              background: profile?.is_owner ? 'var(--accent-dim)' : 'var(--bg-surface-elevated)', 
              color: profile?.is_owner ? 'var(--accent)' : 'var(--text-secondary)', 
              borderRadius: 'var(--radius-md)', 
              border: profile?.is_owner ? '1px solid rgba(201, 153, 42, 0.3)' : '1px solid var(--glass-border)',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontSize: '0.8rem'
            }}>
              {profile?.is_owner ? 'Owner' : 'Beta'}
            </span>
          </div>
        </div>

        {message && (
          <div style={{ background: message.includes('Error') ? 'rgba(139, 58, 58, 0.1)' : 'rgba(74, 124, 89, 0.1)', color: message.includes('Error') ? 'var(--danger)' : 'var(--success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: `1px solid ${message.includes('Error') ? 'rgba(139, 58, 58, 0.3)' : 'rgba(74, 124, 89, 0.3)'}`, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization</label>
              <input 
                type="text" 
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company Context</label>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>The AI reads this to understand your industry, products, and terminology.</p>
            <textarea 
              value={companyContext}
              onChange={e => setCompanyContext(e.target.value)}
              rows={6}
              style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)' }}
            />
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              type="button" 
              onClick={handleSignOut}
              style={{ background: 'transparent', color: 'var(--danger)', border: '1px solid rgba(139, 58, 58, 0.3)', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 500 }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(139, 58, 58, 0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              Sign Out
            </button>
            <button 
              type="submit"
              disabled={saving}
              style={{ 
                background: 'var(--accent)', 
                color: 'white', 
                border: 'none', 
                padding: '0.75rem 2rem', 
                borderRadius: 'var(--radius-md)', 
                fontWeight: 600, 
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
