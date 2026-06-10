import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch(err => {
      console.error("Auth session error:", err);
      setSession(null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError('Check your email for a confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <span className="animate-spin" style={{
          display: 'inline-block',
          width: '24px',
          height: '24px',
          border: '2px solid var(--accent)',
          borderTopColor: 'transparent',
          borderRadius: '50%'
        }}></span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,153,42,0.06) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}></div>

        <div style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2.5rem',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,153,42,0.08)',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '2rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0
            }}>Columny</h1>
            <div style={{
              width: '48px',
              height: '1px',
              background: 'linear-gradient(to right, transparent, var(--accent), transparent)',
              margin: '0.75rem auto'
            }}></div>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              margin: 0
            }}>AI-Powered Sales Intelligence</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.7rem',
                color: 'rgba(232,224,208,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 500,
                marginBottom: '0.4rem'
              }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'var(--font-body)',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.7rem',
                color: 'rgba(232,224,208,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 500,
                marginBottom: '0.4rem'
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.7rem 2.5rem 0.7rem 0.85rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'var(--font-body)',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p style={{
                fontSize: '0.8rem',
                color: error.includes('Check your email') ? 'var(--accent)' : 'var(--danger)',
                margin: 0,
                padding: '0.5rem 0.75rem',
                background: error.includes('Check your email') ? 'rgba(201,153,42,0.08)' : 'rgba(139,58,58,0.1)',
                borderRadius: '6px',
                border: `1px solid ${error.includes('Check your email') ? 'rgba(201,153,42,0.2)' : 'rgba(139,58,58,0.2)'}`
              }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.2s',
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.02em'
              }}
              onMouseOver={e => { if (!submitting) e.currentTarget.style.opacity = '0.9' }}
              onMouseOut={e => { if (!submitting) e.currentTarget.style.opacity = '1' }}
            >
              {submitting ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Toggle */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--accent)'}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--glass-border)'
          }}>
            <p style={{
              fontSize: '0.72rem',
              color: 'var(--text-tertiary)',
              margin: 0,
              letterSpacing: '0.04em'
            }}>Built with precision. Powered by AI.</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
