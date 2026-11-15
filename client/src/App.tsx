import React, { useState, useEffect } from 'react';
import { User } from './types';
import { apiRequest } from './services/api';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { ElderView } from './components/ElderView';
import { CaretakerView } from './components/CaretakerView';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('sehatsathi_token');
        if (token) {
          const res = await apiRequest<{ success: boolean; user: User }>('/api/auth/me');
          if (res.success && res.user) {
            setCurrentUser(res.user);
          }
        }
      } catch (err) {
        localStorage.removeItem('sehatsathi_token');
      } finally {
        setIsInitializing(false);
      }
    };
    checkSession();
  }, []);

  const handleLoginSuccess = (user: User, token: string) => {
    localStorage.setItem('sehatsathi_token', token);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // Proceed with local logout regardless
    }
    localStorage.removeItem('sehatsathi_token');
    setCurrentUser(null);
  };

  if (isInitializing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Loading SehatSathi...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header user={currentUser} onLogout={handleLogout} />

      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {!currentUser ? (
          <LandingPage onLoginSuccess={handleLoginSuccess} />
        ) : currentUser.role === 'ELDER' ? (
          <ElderView />
        ) : (
          <CaretakerView currentUser={currentUser} />
        )}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '20px',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-surface)'
      }}>
        SehatSathi &bull; Dignified Senior Care &bull; Prompt Wars X Catalyst Hackathon 2026
      </footer>
    </div>
  );
};

export default App;
