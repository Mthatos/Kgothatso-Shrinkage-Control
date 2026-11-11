import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Contact from './components/Contact';
import Footer from './components/Footer';
import LoginPage from './components/Auth/LoginPage';
import AdminDashboard from './components/Admin/AdminDashboard';
import ClientDashboard from './components/Client/ClientDashboard';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'website' | 'login' | 'portal'>('website');

  // Sync hash routing if user enters directly
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#portal' || hash === '#dashboard') {
        setView(user ? 'portal' : 'login');
      } else if (hash === '#login') {
        setView('login');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  const handleOpenPortal = () => {
    if (user) {
      setView('portal');
      window.location.hash = '#portal';
    } else {
      setView('login');
      window.location.hash = '#login';
    }
  };

  const handleOpenLogin = () => {
    setView('login');
    window.location.hash = '#login';
  };

  const handleBackToWebsite = () => {
    setView('website');
    window.location.hash = '#home';
  };

  if (loading) {
    return (
      <div className="bg-dark-bg min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400 text-xs">Authenticating system...</span>
        </div>
      </div>
    );
  }

  // Render Login view
  if (view === 'login') {
    return (
      <LoginPage
        onSuccess={() => {
          setView('portal');
          window.location.hash = '#portal';
        }}
        onBackToHome={handleBackToWebsite}
      />
    );
  }

  // Render Portal view (Role-based: Admin vs Client)
  if (view === 'portal' && user) {
    if (user.role === 'ADMIN') {
      return <AdminDashboard onBackToHome={handleBackToWebsite} />;
    }
    return <ClientDashboard onBackToHome={handleBackToWebsite} />;
  }

  // Default: Public Website with preserved sections
  return (
    <div className="bg-dark-bg min-h-screen font-sans">
      <Header
        onOpenPortal={handleOpenPortal}
        onOpenLogin={handleOpenLogin}
        inPortal={false}
      />
      <main>
        <Hero />
        <About />
        <Services />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
