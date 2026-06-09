import React, { useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useDashboards } from '../../hooks/useDashboards';

export default function OnboardingFlow({ onComplete }) {
  const { updateProfile } = useProfile();
  const { createDashboard } = useDashboards();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Profile
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');

  // Step 2: Context
  const [companyContext, setCompanyContext] = useState('');

  // Step 3: First Dashboard
  const [dashboardName, setDashboardName] = useState('');
  const [dashboardContext, setDashboardContext] = useState('');

  const handleNext = async () => {
    if (step === 1 && (!fullName || !organization)) {
      setError('Please fill out all fields.');
      return;
    }
    if (step === 2 && !companyContext) {
      setError('Please provide some context to help the AI.');
      return;
    }
    
    setError('');
    
    if (step < 3) {
      setStep(s => s + 1);
    } else {
      if (!dashboardName || !dashboardContext) {
        setError('Please provide a name and context for your dashboard.');
        return;
      }

      setLoading(true);
      try {
        await updateProfile({
          full_name: fullName,
          organization,
          company_context: companyContext
        });

        await createDashboard({
          name: dashboardName,
          context: dashboardContext,
          description: 'My first dashboard'
        });

        onComplete();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass animate-fade-up" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ 
              height: '4px', 
              flex: 1, 
              background: s <= step ? 'var(--accent)' : 'var(--glass-border)',
              borderRadius: '2px',
              transition: 'background 0.3s ease'
            }} />
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(139, 58, 58, 0.1)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139, 58, 58, 0.3)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-up">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome to Columny</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Let's get to know you a bit.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization</label>
                <input 
                  type="text" 
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                  placeholder="Acme Corp"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-up">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>Your Business Context</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>This helps the AI understand your industry, products, and terminology.</p>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tell us about your work</label>
              <textarea 
                value={companyContext}
                onChange={e => setCompanyContext(e.target.value)}
                rows={5}
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)' }}
                placeholder="We're a B2B SaaS company selling CRM software to mid-market enterprises in Europe..."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-up">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>First Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>What would you like to track first?</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dashboard Name</label>
                <input 
                  type="text" 
                  value={dashboardName}
                  onChange={e => setDashboardName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                  placeholder="e.g. Sales Calls"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracking Context</label>
                <textarea 
                  value={dashboardContext}
                  onChange={e => setDashboardContext(e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)' }}
                  placeholder="I'll be logging outbound sales calls, tracking company names, contact persons, outcomes, and follow-up dates."
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 1 ? (
            <button 
              onClick={() => { setStep(s => s - 1); setError(''); }}
              style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem' }}
            >
              Back
            </button>
          ) : <div></div>}
          
          <button 
            onClick={handleNext}
            disabled={loading}
            style={{ 
              background: 'var(--accent)', 
              color: 'white', 
              border: 'none', 
              padding: '0.75rem 1.5rem', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: 600, 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Setting up...' : (step === 3 ? 'Get Started' : 'Continue')}
          </button>
        </div>

      </div>
    </div>
  );
}
