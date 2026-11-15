import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { User, Role } from '../types';
import { X, Mail, Key, Shield, AlertCircle, CheckCircle, ArrowRight, RotateCw } from 'lucide-react';

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

  // 60-Second Cooldown Timer for OTP Resend
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: any = null;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

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
        setCooldown(60); // Start 60-second timer
        setMessage(`Verification code dispatched to ${email}. Please check your inbox.`);
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
    if (!otp.trim()) {
      setError('Please enter the 6-digit code sent to your email.');
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
    if (!otp.trim()) {
      setError('Please enter the verification code sent to your email.');
      return;
    }
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
        setMessage('Credentials reset successfully. Please sign in with your new PIN/password.');
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
      backgroundColor: 'rgba(24, 78, 119, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '460px',
        padding: '30px',
        maxHeight: '92vh',
        overflowY: 'auto',
        border: '2px solid var(--c-mint)',
        boxShadow: '0 25px 50px -12px rgba(24, 78, 119, 0.25)'
      }}>
        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '12px',
              backgroundColor: 'var(--c-mint-light)',
              color: 'var(--c-deep-ocean)'
            }}>
              {role === 'ELDER' ? 'Senior Patient Portal' : role === 'ADMIN' ? 'Administration Portal' : 'Caregiver & Family Portal'}
            </span>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginTop: '6px' }}>
              {view === 'LOGIN' ? 'Welcome Back' : view === 'REGISTER' ? 'Create Account' : 'Reset Credentials'}
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
          <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '22px' }}>
            <button
              onClick={() => { setView('LOGIN'); setError(null); }}
              style={{
                flex: 1,
                padding: '12px 0',
                fontWeight: 800,
                fontSize: '0.95rem',
                color: view === 'LOGIN' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
                borderBottom: view === 'LOGIN' ? '3px solid var(--c-teal-green)' : 'none'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setView('REGISTER'); setError(null); }}
              style={{
                flex: 1,
                padding: '12px 0',
                fontWeight: 800,
                fontSize: '0.95rem',
                color: view === 'REGISTER' ? 'var(--c-deep-ocean)' : 'var(--text-muted)',
                borderBottom: view === 'REGISTER' ? '3px solid var(--c-teal-green)' : 'none'
              }}
            >
              New Registration
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            backgroundColor: 'var(--status-missed-bg)',
            color: 'var(--status-missed)',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            marginBottom: '16px',
            lineHeight: 1.4
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            marginBottom: '16px'
          }}>
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {view === 'LOGIN' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--c-deep-ocean)' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--c-deep-ocean)' }}>
                  {role === 'ELDER' ? '4-Digit Senior PIN' : 'Account Password'}
                </label>
                {role !== 'ADMIN' && (
                  <button
                    type="button"
                    onClick={() => { setView('FORGOT'); setError(null); }}
                    style={{ fontSize: '0.8rem', color: 'var(--c-ocean-teal)', fontWeight: 700 }}
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
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: '8px',
                backgroundColor: 'var(--c-deep-ocean)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1rem',
                marginTop: '18px',
                boxShadow: '0 4px 6px rgba(24, 78, 119, 0.2)'
              }}
            >
              {submitLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* 2. REGISTRATION FORM WITH REAL EMAIL OTP & 60-SEC RESEND TIMER */}
        {view === 'REGISTER' && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: 'var(--c-deep-ocean)' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'ELDER' ? 'e.g. Ramesh Sharma' : 'e.g. Aarav Sharma'}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
              />
            </div>

            {/* Email + Send/Resend OTP button with 60s cooldown */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: 'var(--c-deep-ocean)' }}>
                Email Address
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  required
                  value={email}
                  disabled={otpSent && cooldown > 0}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
                <button
                  type="button"
                  onClick={() => handleSendOtp('REGISTER')}
                  disabled={otpLoading || cooldown > 0}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    backgroundColor: cooldown > 0 ? '#E2E8F0' : 'var(--c-teal-green)',
                    color: cooldown > 0 ? '#64748B' : '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    cursor: cooldown > 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {otpLoading ? 'Sending...' : cooldown > 0 ? `Resend (${cooldown}s)` : otpSent ? 'Resend Code' : 'Send Code'}
                </button>
              </div>
            </div>

            {/* 6-Digit OTP Box */}
            {otpSent && (
              <div style={{ marginBottom: '14px', backgroundColor: 'var(--c-lime)', padding: '14px', borderRadius: '8px', border: '1px solid var(--c-mint)' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '6px' }}>
                  Enter 6-Digit Code Received on Email
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  placeholder="Enter 6-digit OTP"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '2px solid var(--c-deep-ocean)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '4px' }}
                />
              </div>
            )}

            {/* PIN or Password */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: 'var(--c-deep-ocean)' }}>
                {role === 'ELDER' ? 'Create 4-Digit Senior PIN' : 'Create Password'}
              </label>
              <input
                type="password"
                required
                maxLength={role === 'ELDER' ? 4 : 50}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder={role === 'ELDER' ? '4-digit numeric PIN' : 'At least 6 characters'}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
              />
            </div>

            {role === 'ELDER' ? (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: 'var(--c-deep-ocean)' }}>
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: 'var(--c-deep-ocean)' }}>
                    Relationship to Patient
                  </label>
                  <input
                    type="text"
                    required
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="e.g. Son, Daughter, Nurse"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: 'var(--c-deep-ocean)' }}>
                    Patient Link Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={linkCode}
                    onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                    placeholder="e.g. EL-8492"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', textTransform: 'uppercase', fontWeight: 700 }}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitLoading || !otpSent}
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: '8px',
                backgroundColor: 'var(--c-deep-ocean)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1rem',
                marginTop: '16px',
                opacity: !otpSent ? 0.6 : 1,
                boxShadow: '0 4px 6px rgba(24, 78, 119, 0.2)'
              }}
            >
              {submitLoading ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* 3. FORGOT CREDENTIALS WITH OTP & RESEND COOLDOWN */}
        {view === 'FORGOT' && (
          <form onSubmit={handleResetCredential}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              Enter your registered email address to receive a verification code and configure a new {role === 'ELDER' ? '4-digit PIN' : 'password'}.
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: 'var(--c-deep-ocean)' }}>
                Email Address
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  required
                  value={email}
                  disabled={otpSent && cooldown > 0}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                />
                <button
                  type="button"
                  onClick={() => handleSendOtp('RESET_CREDENTIAL')}
                  disabled={otpLoading || cooldown > 0}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    backgroundColor: cooldown > 0 ? '#E2E8F0' : 'var(--c-teal-green)',
                    color: cooldown > 0 ? '#64748B' : '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {otpLoading ? 'Sending...' : cooldown > 0 ? `Resend (${cooldown}s)` : 'Send Code'}
                </button>
              </div>
            </div>

            {otpSent && (
              <>
                <div style={{ marginBottom: '14px', backgroundColor: 'var(--c-lime)', padding: '14px', borderRadius: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '6px' }}>
                    Enter 6-Digit Code Received on Email
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
                    placeholder="123456"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '2px solid var(--c-deep-ocean)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '4px' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: 'var(--c-deep-ocean)' }}>
                    New {role === 'ELDER' ? '4-Digit PIN' : 'Password'}
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={role === 'ELDER' ? 4 : 50}
                    value={newCredential}
                    onChange={(e) => setNewCredential(e.target.value)}
                    placeholder={role === 'ELDER' ? 'New 4-digit PIN' : 'New Password (min 6 chars)'}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    borderRadius: '8px',
                    backgroundColor: 'var(--c-deep-ocean)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '1rem',
                    boxShadow: '0 4px 6px rgba(24, 78, 119, 0.2)'
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
                fontSize: '0.88rem',
                color: 'var(--c-ocean-teal)',
                fontWeight: 700
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
