import React, { useState } from 'react';
import { UndoProvider } from './context/UndoContext';
import AuthGate from './components/Auth/AuthGate';
import AppShell from './components/Layout/AppShell';
import HomePage from './components/Home/HomePage';
import ProfilePage from './components/Profile/ProfilePage';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import { SchemaProvider } from './context/SchemaContext';
import { useProfile } from './hooks/useProfile';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function AppContent() {
  const { profile, loading } = useProfile();
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('columny_current_view') || 'home';
  });
  const [activeDashboardId, setActiveDashboardId] = useState(() => {
    return localStorage.getItem('columny_dashboard_id') || null;
  });

  // Sync state to localStorage
  React.useEffect(() => {
    localStorage.setItem('columny_current_view', currentView);
  }, [currentView]);

  React.useEffect(() => {
    if (activeDashboardId) {
      localStorage.setItem('columny_dashboard_id', activeDashboardId);
    } else {
      localStorage.removeItem('columny_dashboard_id');
    }
  }, [activeDashboardId]);

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)' }}>Loading...</div>;
  }

  if (!profile || (!profile.full_name && !profile.organization)) {
    return <OnboardingFlow onComplete={() => setCurrentView('home')} />;
  }

  if (currentView === 'profile') {
    return <ProfilePage onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'dashboard' && activeDashboardId) {
    return (
      <SchemaProvider dashboardId={activeDashboardId}>
        <AppShell 
          onNavigateHome={() => setCurrentView('home')} 
          onNavigateProfile={() => setCurrentView('profile')} 
          dashboardId={activeDashboardId}
        />
      </SchemaProvider>
    );
  }

  return (
    <HomePage 
      onSelectDashboard={(id) => {
        setActiveDashboardId(id);
        setCurrentView('dashboard');
      }} 
      onNavigateProfile={() => setCurrentView('profile')}
    />
  );
}


function App() {
  return (
    <ErrorBoundary>
      <UndoProvider>
        <AuthGate>
          <AppContent />
        </AuthGate>
      </UndoProvider>
    </ErrorBoundary>
  );
}

export default App;
