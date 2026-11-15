import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../services/api';
import { User, Role } from '../types';
import { X, Mail, Key, Shield, AlertCircle, CheckCircle, ArrowRight, RotateCw, Check } from 'lucide-react';

interface AuthModalProps {
  initialRole: 'ELDER' | 'CARETAKER' | 'ADMIN';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

const SixDigitOtpInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
}> = ({ value, onChange }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join('');
    onChange(combined);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div style={{ margin: '16px 0 16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
          Enter 6-Digit Verification Code
        </label>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00AC73' }}>
          Valid for 5 min
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i] || ''}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            style={{
              width: '100%',
              maxWidth: '54px',
              height: '52px',
              textAlign: 'center',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#0F172A',
              backgroundColor: digits[i] ? '#F0FDF4' : '#F8FAFC',
              border: digits[i] ? '2px solid #00AC73' : '1.5px solid #CBD5E1',
              borderRadius: '10px',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#00AC73';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 172, 115, 0.2)';
              e.currentTarget.select();
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = digits[i] ? '#00AC73' : '#CBD5E1';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        ))}
      </div>
    </div>
  );
};

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
      const payload: any = role === 'ELDER'
        ? { email, pin: credential }
        : { email, password: credential };

      if (role === 'ADMIN' && otpSent && otp) {
        payload.otp = otp;
      }

      const res = await apiRequest<{ success: boolean; token?: string; user?: User; requiresOtp?: boolean; message?: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.requiresOtp) {
        setOtpSent(true);
        setCooldown(60);
        setMessage(res.message || 'Security 2FA code dispatched to your registered email.');
        return;
      }

      if (res.success && res.user && res.token) {
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
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1000
      }}
    >
      <div 
        className="no-scrollbar"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '460px',
          padding: '32px',
          maxHeight: '92vh',
          overflowY: 'auto',
          border: '1px solid rgba(226, 232, 240, 0.95)',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.22)'
        }}
      >
        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <span style={{
              fontSize: '0.76rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: '#E8F8EE',
              color: '#00704A',
              border: '1px solid #A7F3D0'
            }}>
              {role === 'ELDER' ? 'Senior Patient Portal' : role === 'ADMIN' ? 'Administration Portal' : 'Caregiver & Family Portal'}
            </span>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
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
          <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '22px' }}>
            <button
              onClick={() => { setView('LOGIN'); setError(null); }}
              style={{
                flex: 1,
                padding: '12px 0',
                fontWeight: 800,
                fontSize: '0.95rem',
                color: view === 'LOGIN' ? '#0F172A' : '#64748B',
                borderBottom: view === 'LOGIN' ? '3px solid #00AC73' : 'none'
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
                color: view === 'REGISTER' ? '#0F172A' : '#64748B',
                borderBottom: view === 'REGISTER' ? '3px solid #00AC73' : 'none'
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
            backgroundColor: '#FEE2E2',
            color: '#B91C1C',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            marginBottom: '16px',
            lineHeight: 1.4,
            border: '1px solid #FECACA'
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
            borderRadius: '10px',
            fontSize: '0.88rem',
            marginBottom: '16px',
            border: '1px solid #BBF7D0'
          }}>
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {view === 'LOGIN' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#0F172A' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                  {role === 'ELDER' ? '4-Digit Senior PIN' : 'Account Password'}
                </label>
                {role !== 'ADMIN' && (
                  <button
                    type="button"
                    onClick={() => { setView('FORGOT'); setError(null); }}
                    style={{ fontSize: '0.82rem', color: '#0284C7', fontWeight: 700 }}
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
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem' }}
              />
            </div>

            {/* If Admin and OTP has been dispatched, render 6-digit OTP */}
            {role === 'ADMIN' && otpSent && (
              <SixDigitOtpInput value={otp} onChange={setOtp} />
            )}

            <button
              type="submit"
              disabled={submitLoading || (role === 'ADMIN' && otpSent && otp.length < 6)}
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: '12px',
                backgroundColor: '#00AC73',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1rem',
                marginTop: '18px',
                boxShadow: '0 4px 14px rgba(0, 172, 115, 0.25)',
                cursor: submitLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {submitLoading
                ? 'Verifying...'
                : role === 'ADMIN' && otpSent
                ? 'Confirm & Enter Admin Console'
                : role === 'ADMIN'
                ? 'Verify Password & Request OTP'
                : 'Sign In'}
            </button>
          </form>
        )}

        {/* 2. REGISTRATION FORM WITH REAL EMAIL OTP & 60-SEC RESEND TIMER */}
        {view === 'REGISTER' && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#0F172A' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'ELDER' ? 'e.g. Ramesh Sharma' : 'e.g. Aarav Sharma'}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem' }}
              />
            </div>

            {/* Email + Send/Resend OTP button with 60s cooldown */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#0F172A' }}>
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
                  style={{ flex: 1, padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem' }}
                />
                <button
                  type="button"
                  onClick={() => handleSendOtp('REGISTER')}
                  disabled={otpLoading || cooldown > 0}
                  style={{
                    padding: '11px 18px',
                    borderRadius: '10px',
                    backgroundColor: cooldown > 0 ? '#F1F5F9' : otpLoading ? '#CBD5E1' : '#00AC73',
                    color: cooldown > 0 ? '#64748B' : '#FFFFFF',
                    border: cooldown > 0 ? '1px solid #CBD5E1' : 'none',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    cursor: cooldown > 0 || otpLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '135px',
                    textAlign: 'center'
                  }}
                >
                  {otpLoading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : otpSent ? 'Resend Code' : 'Send Code'}
                </button>
              </div>
            </div>

            {/* 6-Digit Modern Segmented OTP Component */}
            {otpSent && (
              <SixDigitOtpInput value={otp} onChange={setOtp} />
            )}

            {/* PIN or Password */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#0F172A' }}>
                {role === 'ELDER' ? 'Create 4-Digit Senior PIN' : 'Create Password'}
              </label>
              <input
                type="password"
                required
                maxLength={role === 'ELDER' ? 4 : 50}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder={role === 'ELDER' ? '4-digit numeric PIN' : 'At least 6 characters'}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem' }}
              />
            </div>

            {role === 'ELDER' ? (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#0F172A' }}>
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem' }}
                />
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#0F172A' }}>
                    Relationship to Patient
                  </label>
                  <input
                    type="text"
                    required
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="e.g. Son, Daughter, Nurse"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#0F172A' }}>
                    Patient Link Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={linkCode}
                    onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                    placeholder="e.g. EL-8492"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', textTransform: 'uppercase', fontWeight: 700, fontSize: '0.95rem' }}
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
                borderRadius: '12px',
                backgroundColor: !otpSent ? '#F1F5F9' : '#00AC73',
                color: !otpSent ? '#64748B' : '#FFFFFF',
                border: !otpSent ? '1.5px solid #E2E8F0' : 'none',
                fontWeight: 700,
                fontSize: '0.98rem',
                marginTop: '18px',
                boxShadow: otpSent ? '0 4px 14px rgba(0, 172, 115, 0.25)' : 'none',
                cursor: !otpSent || submitLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {!otpSent ? 'Enter Email & Send Code to Verify' : submitLoading ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* 3. FORGOT CREDENTIALS WITH OTP & RESEND COOLDOWN */}
        {view === 'FORGOT' && (
          <form onSubmit={handleResetCredential}>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '16px', lineHeight: 1.5 }}>
              Enter your registered email address to receive a verification code and configure a new {role === 'ELDER' ? '4-digit PIN' : 'password'}.
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#0F172A' }}>
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
                  style={{ flex: 1, padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem' }}
                />
                <button
                  type="button"
                  onClick={() => handleSendOtp('RESET_CREDENTIAL')}
                  disabled={otpLoading || cooldown > 0}
                  style={{
                    padding: '11px 18px',
                    borderRadius: '10px',
                    backgroundColor: cooldown > 0 ? '#F1F5F9' : otpLoading ? '#CBD5E1' : '#00AC73',
                    color: cooldown > 0 ? '#64748B' : '#FFFFFF',
                    border: cooldown > 0 ? '1px solid #CBD5E1' : 'none',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    cursor: cooldown > 0 || otpLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '135px',
                    textAlign: 'center'
                  }}
                >
                  {otpLoading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send Code'}
                </button>
              </div>
            </div>

            {otpSent && (
              <>
                <SixDigitOtpInput value={otp} onChange={setOtp} />

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#0F172A' }}>
                    New {role === 'ELDER' ? '4-Digit PIN' : 'Password'}
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={role === 'ELDER' ? 4 : 50}
                    value={newCredential}
                    onChange={(e) => setNewCredential(e.target.value)}
                    placeholder={role === 'ELDER' ? 'New 4-digit PIN' : 'New Password (min 6 chars)'}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    borderRadius: '12px',
                    backgroundColor: '#00AC73',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: '0 4px 14px rgba(0, 172, 115, 0.25)',
                    cursor: submitLoading ? 'not-allowed' : 'pointer'
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
                color: '#0284C7',
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
