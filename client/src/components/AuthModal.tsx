import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import { User, Role } from '../types';
import { X, Mail, Key, Shield, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  initialRole: 'ELDER' | 'CARETAKER' | 'ADMIN';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialRole, isOpen, onClose, onSuccess }) => {
  const [view, setView] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [role, setRole] = useState<'ELDER' | 'CARETAKER' | 'ADMIN'>(initialRole);

  // Form fields
  const [email, setEmail] = useState('');
  const [credential, setCredential] = useState(''); // PIN or Password
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [relationship, setRelationship] = useState('Son / Daughter');
  const [linkCode, setLinkCode] = useState('');
  const [newCredential, setNewCredential] = useState('');

  // Status state
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (purpose: 'REGISTER' | 'RESET_CREDENTIAL') => {
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setError(null);
    setMessage(null);
    setOtpLoading(true);

    try {
      const res = await apiRequest<{ success: boolean; message: string }>('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email, purpose })
      });
      if (res.success) {
        setOtpSent(true);
        if ((res as any).devOtp) {
          setOtp((res as any).devOtp);
          setMessage(`Verification code dispatched to ${email}. [Code auto-filled: ${(res as any).devOtp}]`);
        } else {
          setMessage(`Verification code dispatched to ${email}. Please check your inbox.`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Could not send verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitLoading(true);

    try {
      const payload = role === 'ELDER'
        ? { email, pin: credential }
        : { email, password: credential };

      const res = await apiRequest<{ success: boolean; token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        onSuccess(res.user, res.token);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setError('Please request a verification code first.');
      return;
    }
    setError(null);
    setSubmitLoading(true);

    try {
      if (role === 'ELDER') {
        const res = await apiRequest<{ success: boolean; token: string; user: User }>('/api/auth/register-elder', {
          method: 'POST',
          body: JSON.stringify({
            email,
            otp,
            name,
            pin: credential,
            phone,
            emergencyPhone
          })
        });
        if (res.success) {
          onSuccess(res.user, res.token);
          onClose();
        }
      } else {
        const res = await apiRequest<{ success: boolean; token: string; user: User }>('/api/auth/register-caregiver', {
          method: 'POST',
          body: JSON.stringify({
            email,
            otp,
            name,
            password: credential,
            phone,
            role: 'CARETAKER',
            relationship,
            linkCode: linkCode || undefined
          })
        });
        if (res.success) {
          onSuccess(res.user, res.token);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleResetCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitLoading(true);

    try {
      const res = await apiRequest<{ success: boolean; message: string }>('/api/auth/reset-credential', {
        method: 'POST',
        body: JSON.stringify({
          email,
          otp,
          newCredential
        })
      });

      if (res.success) {
        setMessage('Credentials reset successfully! Please sign in with your new PIN/password.');
        setView('LOGIN');
        setOtpSent(false);
        setCredential('');
        setOtp('');
      }
    } catch (err: any) {
      setError(err.message || 'Credential reset failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '460px',
        padding: '28px',
        maxHeight: '92vh',
        overflowY: 'auto',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--c-deep-ocean)'
            }}>
              {role === 'ELDER' ? 'Senior Patient Portal' : role === 'ADMIN' ? 'Administration Portal' : 'Caregiver & Family Portal'}
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginTop: '4px' }}>
              {view === 'LOGIN' ? 'Sign In' : view === 'REGISTER' ? 'Register Account' : 'Reset Credentials'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* View Switcher Tabs (Login vs Register) */}
        {role !== 'ADMIN' && view !== 'FORGOT' && (
          <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '20px' }}>
            <button
              onClick={() => { setView('LOGIN'); setError(null); }}
              style={{
                flex: 1,
                padding: '10px 0',
                fontWeight: 700,
                fontSize: '0.92rem',
                color: view === 'LOGIN' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
                borderBottom: view === 'LOGIN' ? '3px solid var(--c-deep-ocean)' : 'none'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setView('REGISTER'); setError(null); }}
              style={{
                flex: 1,
                padding: '10px 0',
                fontWeight: 700,
                fontSize: '0.92rem',
                color: view === 'REGISTER' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
                borderBottom: view === 'REGISTER' ? '3px solid var(--c-deep-ocean)' : 'none'
              }}
            >
              Register New
            </button>
          </div>
        )}

        {/* Alerts */}
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

        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--status-taken-bg)',
            color: 'var(--status-taken)',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '0.88rem',
            marginBottom: '16px'
          }}>
            <CheckCircle size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {view === 'LOGIN' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {role === 'ELDER' ? '4-Digit Senior PIN' : 'Password'}
                </label>
                {role !== 'ADMIN' && (
                  <button
                    type="button"
                    onClick={() => { setView('FORGOT'); setError(null); }}
                    style={{ fontSize: '0.78rem', color: 'var(--c-ocean-teal)', fontWeight: 600 }}
                  >
                    Forgot {role === 'ELDER' ? 'PIN' : 'Password'}?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                maxLength={role === 'ELDER' ? 4 : 50}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder={role === 'ELDER' ? '4-digit PIN' : 'Password'}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: '6px',
                backgroundColor: 'var(--c-deep-ocean)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1rem',
                marginTop: '16px'
              }}
            >
              {submitLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* 2. REGISTRATION FORM WITH EMAIL OTP */}
        {view === 'REGISTER' && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'ELDER' ? 'e.g. Ramesh Sharma' : 'e.g. Aarav Sharma'}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
              />
            </div>

            {/* Email + Send OTP button */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Email Address
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  required
                  value={email}
                  disabled={otpSent}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                />
                <button
                  type="button"
                  onClick={() => handleSendOtp('REGISTER')}
                  disabled={otpLoading || otpSent}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--c-ocean-teal)',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {otpLoading ? 'Sending...' : otpSent ? 'Code Sent' : 'Send Code'}
                </button>
              </div>
            </div>

            {/* 6-Digit OTP */}
            {otpSent && (
              <div style={{ marginBottom: '12px', backgroundColor: 'var(--bg-subtle)', padding: '10px', borderRadius: '6px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--c-deep-ocean)', marginBottom: '4px' }}>
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--c-ocean-teal)', fontWeight: 700, letterSpacing: '2px' }}
                />
              </div>
            )}

            {/* Credential: PIN or Password */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                {role === 'ELDER' ? 'Create 4-Digit Senior PIN' : 'Create Account Password'}
              </label>
              <input
                type="password"
                required
                maxLength={role === 'ELDER' ? 4 : 50}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder={role === 'ELDER' ? '4-digit numeric PIN' : 'At least 6 characters'}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
              />
            </div>

            {role === 'ELDER' ? (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Emergency Phone Contact
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Relationship to Patient
                  </label>
                  <input
                    type="text"
                    required
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="e.g. Son, Daughter, Nurse"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Patient Link Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={linkCode}
                    onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                    placeholder="e.g. EL-8492"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)', textTransform: 'uppercase' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    If your parent has an account, enter their code to automatically connect.
                  </span>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitLoading || !otpSent}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: '6px',
                backgroundColor: 'var(--c-deep-ocean)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1rem',
                marginTop: '16px',
                opacity: !otpSent ? 0.6 : 1
              }}
            >
              {submitLoading ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* 3. FORGOT CREDENTIALS WITH OTP */}
        {view === 'FORGOT' && (
          <form onSubmit={handleResetCredential}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Enter your registered email to receive a verification code and set a new {role === 'ELDER' ? '4-digit PIN' : 'password'}.
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Email Address
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  required
                  value={email}
                  disabled={otpSent}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                />
                <button
                  type="button"
                  onClick={() => handleSendOtp('RESET_CREDENTIAL')}
                  disabled={otpLoading || otpSent}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--c-ocean-teal)',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 700
                  }}
                >
                  {otpLoading ? 'Sending...' : otpSent ? 'Sent' : 'Send Code'}
                </button>
              </div>
            </div>

            {otpSent && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontWeight: 700 }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    New {role === 'ELDER' ? '4-Digit PIN' : 'Password'}
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={role === 'ELDER' ? 4 : 50}
                    value={newCredential}
                    onChange={(e) => setNewCredential(e.target.value)}
                    placeholder={role === 'ELDER' ? 'New 4-digit PIN' : 'New Password (min 6 chars)'}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    borderRadius: '6px',
                    backgroundColor: 'var(--c-deep-ocean)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '1rem'
                  }}
                >
                  {submitLoading ? 'Updating...' : 'Update & Reset'}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => { setView('LOGIN'); setError(null); }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                marginTop: '16px',
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
              }}
            >
              Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
