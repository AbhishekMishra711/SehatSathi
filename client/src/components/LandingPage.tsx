import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import { User, Role } from '../types';
import { Shield, Clock, Bell, UserCheck, AlertCircle } from 'lucide-react';

interface LandingPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [credential, setCredential] = useState('');
  const [isElderMode, setIsElderMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = isElderMode
        ? { email, pin: credential }
        : { email, password: credential };

      const res = await apiRequest<{ success: boolean; token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        localStorage.setItem('sehatsathi_token', res.token);
        onLoginSuccess(res.user, res.token);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: Role) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiRequest<{ success: boolean; token: string; user: User }>('/api/auth/quick-demo-login', {
        method: 'POST',
        body: JSON.stringify({ role })
      });

      if (res.success) {
        localStorage.setItem('sehatsathi_token', res.token);
        onLoginSuccess(res.user, res.token);
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>
      {/* Intro hero for judges and users */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '36px 32px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '16px', backgroundColor: 'var(--primary-teal-light)', color: 'var(--primary-teal)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '14px' }}>
          Elderly Care & Medication Management Platform
        </div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
          Dignified medication management, with the senior at the center.
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '780px', lineHeight: 1.6 }}>
          SehatSathi provides seniors with an accessible phone-first interface, 
          backed by an intelligent multi-tier escalation chain, elder-controlled access permissions, 
          and safe AI-assisted prescription scheduling.
        </p>

        {/* Feature pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '28px' }}>
          <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
            <Clock size={22} color="var(--primary-teal)" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Automated Escalation</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Reminds elder first. If missed past grace window, escalates to caretaker, then family.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
            <UserCheck size={22} color="var(--primary-teal)" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Elder in Control</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Seniors decide what family members can edit or view, with full revocation power.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
            <Shield size={22} color="var(--primary-teal)" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Audited & Safe</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Every dose, schedule change, and access grant is recorded in a tamper-evident audit log.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Demo Access Bar (Highlighted for hackathon evaluation) */}
      <div style={{
        backgroundColor: '#F8FAFC',
        border: '2px solid var(--primary-teal)',
        borderRadius: '12px',
        padding: '28px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Bell size={20} color="var(--primary-teal)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Judge & Demo Evaluation Access
          </h2>
        </div>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Explore pre-seeded test accounts with one click to test the mobile senior interface and caretaker dashboard:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <button
            onClick={() => handleQuickDemo('ELDER')}
            disabled={isLoading}
            style={{
              padding: '16px 20px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              textAlign: 'left',
              transition: 'border-color 0.2s',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-teal)', marginBottom: '4px' }}>
              Sign in as Senior
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }}>Ramesh Sharma (Age 72)</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              4-digit PIN login, high-contrast PWA view, voice audio readout.
            </div>
          </button>

          <button
            onClick={() => handleQuickDemo('CARETAKER')}
            disabled={isLoading}
            style={{
              padding: '16px 20px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              textAlign: 'left',
              transition: 'border-color 0.2s',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-teal)', marginBottom: '4px' }}>
              Sign in as Caretaker
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }}>Aarav Sharma (Son)</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Full dashboard, Gemini prescription parser, escalation simulator.
            </div>
          </button>

          <button
            onClick={() => handleQuickDemo('FAMILY')}
            disabled={isLoading}
            style={{
              padding: '16px 20px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              textAlign: 'left',
              transition: 'border-color 0.2s',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-teal)', marginBottom: '4px' }}>
              Sign in as Family
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }}>Priya Sharma (Daughter)</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              View-only permissions demo, appointment manager, adherence logs.
            </div>
          </button>
        </div>
      </div>

      {/* Manual sign in card */}
      <div style={{
        maxWidth: '460px',
        margin: '0 auto',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '30px'
      }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
          Manual Account Login
        </h2>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--status-missed-bg)',
            color: 'var(--status-missed)',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '0.88rem',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => { setIsElderMode(true); setCredential(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: isElderMode ? 'var(--primary-teal)' : 'var(--text-muted)',
              borderBottom: isElderMode ? '2px solid var(--primary-teal)' : 'none'
            }}
          >
            Senior (PIN)
          </button>
          <button
            type="button"
            onClick={() => { setIsElderMode(false); setCredential(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: !isElderMode ? 'var(--primary-teal)' : 'var(--text-muted)',
              borderBottom: !isElderMode ? '2px solid var(--primary-teal)' : 'none'
            }}
          >
            Caretaker / Family
          </button>
        </div>

        <form onSubmit={handleManualLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isElderMode ? "ramesh@sehatsathi.demo" : "aarav@sehatsathi.demo"}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-strong)',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              {isElderMode ? '4-Digit Senior PIN' : 'Account Password'}
            </label>
            <input
              type={isElderMode ? "password" : "password"}
              maxLength={isElderMode ? 6 : 50}
              required
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              placeholder={isElderMode ? "1234" : "Password123!"}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-strong)',
                fontSize: '0.95rem'
              }}
            />
            {isElderMode && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Account lockout automatically engages after 5 failed attempts.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: '6px',
              backgroundColor: 'var(--primary-teal)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
