import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Heart,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  X,
  Lock,
  KeyRound,
  Clock,
  Eye,
  AlertTriangle,
  PhoneCall,
  BellRing,
  Sparkles,
  Volume2,
  Calendar,
  Smartphone
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { User } from '../types';

interface LandingPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  defaultAdminOpen?: boolean;
}

interface FeatureDetail {
  title: string;
  badge: string;
  shortDesc: string;
  fullDesc: string[];
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess, defaultAdminOpen }) => {
  const [modalRole, setModalRole] = useState<'ELDER' | 'CARETAKER' | 'ADMIN' | null>(defaultAdminOpen ? 'ADMIN' : null);
  const [activeFeatureModal, setActiveFeatureModal] = useState<FeatureDetail | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Persistent Scroll Reveal Observer
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isSectionRevealed, setIsSectionRevealed] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPrivacyModal(false);
        setActiveFeatureModal(null);
        setModalRole(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsSectionRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features: FeatureDetail[] = [
    {
      title: 'One-Touch Senior PWA',
      badge: 'Senior Accessibility',
      shortDesc: 'Extra-large touch targets and simple 4-digit PIN authentication designed specifically for seniors.',
      fullDesc: [
        'Built specifically for aging eyes and one-thumb navigation on any smartphone.',
        'Uses an accessible high-contrast palette with 48px+ touch targets and a single primary action per screen.',
        'Protected by Bcrypt PIN hashing and automatic 15-minute account lockout after 5 failed attempts.',
        'Includes browser-native speech synthesis to read dosage and instructions aloud for low-vision patients.'
      ]
    },
    {
      title: 'AI Voice & Health Companion',
      badge: 'Sathi AI',
      shortDesc: 'A natural voice and chat companion strictly bounded to the patient’s medications and routine.',
      fullDesc: [
        'Seniors can speak directly into their smartphone microphone or type natural questions.',
        'Live contextual awareness: Knows the patient’s exact medications for today, doctor appointments, and notes.',
        'Strict safety guardrails: Strictly rejects off-topic queries and provides compassionate, clear guidance on diet and dosage.',
        'Includes one-touch audio playback on every answer so seniors can listen instead of reading.'
      ]
    },
    {
      title: 'Smart Escalation Chain',
      badge: 'Safety Net',
      shortDesc: 'Multi-tier alerts to caretakers and family if a scheduled medication dose is missed.',
      fullDesc: [
        'Deterministic three-tier escalation: Elder reminder first, followed by primary caretaker alert, then extended family notification.',
        'Runs on an idempotent cron architecture, ensuring no repeated or duplicate email dispatches.',
        'Built with pure time evaluation functions, making the entire escalation timeline verifiable and deterministic.',
        'Includes a live testing simulator in the caretaker dashboard for real-time safety verification.'
      ]
    },
    {
      title: 'Elder-Controlled Permissions',
      badge: 'Dignity & Control',
      shortDesc: 'Seniors decide what family members can view or edit, with instant revocation power.',
      fullDesc: [
        'Dignity-first architecture: Seniors generate a private link code to invite family members.',
        'Granular control: The senior can grant view-only access or medication-editing permissions.',
        'Instant revocation: One tap in the senior profile immediately disconnects any family member.',
        'Family activity logs show seniors exactly who checked their schedule.'
      ]
    },
    {
      title: 'Gemini Schedule Parser',
      badge: 'Verified AI',
      shortDesc: 'Turns messy prescription sentences into structured schedules with human verification.',
      fullDesc: [
        'Upload prescription notes or paste doctor instructions (e.g., "Metformin 500mg twice daily with meals").',
        'Gemini 2.0 extracts structured dosage, times, meal relation, and potential safety warnings.',
        'Human-in-the-loop: Caretakers verify and approve the schedule before it goes live to the senior.',
        'Detects conflicting schedule entries to prevent double dosing.'
      ]
    },
    {
      title: 'Tamper-Evident Audit Trail',
      badge: 'Accountability',
      shortDesc: 'Complete transparency: logs who confirmed doses, modified meds, or received alerts.',
      fullDesc: [
        'Every single dose marked taken, missed, or confirmed is permanently recorded with a timestamp.',
        'Caretakers can see exactly whether the senior confirmed the dose or if a caregiver assisted.',
        'Audit logs cannot be edited or deleted by non-admin users.',
        'Exportable history for doctor visits and clinical medication reviews.'
      ]
    }
  ];

  return (
    <div className="bg-subtle-grid" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Floating Capsule Navbar (Containerized & Centered, Like Apple / Modern SaaS) */}
      <header style={{
        position: 'sticky',
        top: '16px',
        zIndex: 100,
        maxWidth: '1240px',
        width: 'calc(100% - 32px)',
        margin: '12px auto 0 auto'
      }}>
        <nav className="floating-capsule-nav" style={{
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Brand Logo & Editorial Typography */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.png"
              alt="SehatSathi Care Logo"
              className="animate-logo-entrance logo-pulse"
              style={{
                width: '42px',
                height: '42px',
                objectFit: 'contain'
              }}
            />
            <div className="animate-title-slide">
              <span style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.025em',
                display: 'block',
                lineHeight: 1.1
              }}>
                SehatSathi
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#00A86B',
                letterSpacing: '0.8px'
              }}>
                DIGNIFIED SENIOR CARE
              </span>
            </div>
          </div>

          {/* Center Minimal Navigation Links with Hover Pill Styles */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <button
              onClick={() => {
                const el = document.getElementById('features-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="nav-link"
            >
              Features
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('escalation-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="nav-link"
            >
              Escalation Protocol
            </button>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="nav-link"
            >
              Safety & Privacy
            </button>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setModalRole('ELDER')}
              style={{
                padding: '9px 20px',
                borderRadius: '9999px',
                backgroundColor: '#E8F8EE',
                border: '1px solid #A7F3D0',
                color: '#00875A',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Patient Access
            </button>

            <button
              onClick={() => setModalRole('CARETAKER')}
              style={{
                padding: '9px 22px',
                borderRadius: '9999px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
              }}
            >
              <span>Caretaker Portal</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section: Modern, Breathable & Editorial (Consulto + SmartCare feel) */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '52px 28px 48px 28px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        width: '100%'
      }} className="animate-hero">
        
        {/* Subtle Eyebrow Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 18px',
          borderRadius: '9999px',
          backgroundColor: '#E8F8EE',
          color: '#00704A',
          fontSize: '0.86rem',
          fontWeight: 700,
          marginBottom: '22px',
          border: '1px solid #A7F3D0',
          boxShadow: '0 2px 8px rgba(167, 243, 208, 0.4)'
        }}>
          <Sparkles size={16} color="#00A86B" />
          <span>Patient-Centered Elderly Care & Medication Management</span>
        </div>

        {/* Editorial Modern Headline */}
        <h1 style={{
          fontSize: 'clamp(2.7rem, 5.5vw, 4.4rem)',
          fontWeight: 800,
          letterSpacing: '-0.035em',
          lineHeight: 1.15,
          color: '#0F172A',
          maxWidth: '1100px',
          margin: '0 auto 20px auto'
        }}>
          Dignified Healthcare for Seniors.{' '}
          <span style={{
            background: 'linear-gradient(135deg, #00A86B 0%, #0284C7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Peace of Mind for Families.
          </span>
        </h1>

        {/* Humanized Subtext */}
        <p style={{
          fontSize: '1.18rem',
          fontWeight: 500,
          color: '#64748B',
          maxWidth: '820px',
          margin: '0 auto 36px auto',
          lineHeight: 1.65
        }}>
          SehatSathi empowers seniors with an accessible, high-contrast mobile interface, voice audio assistant, 
          and an intelligent escalation chain that keeps family notified when doses are missed.
        </p>

        {/* Floating Category Pills (Inspired by Consulto's quick category pills) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '44px'
        }}>
          <span style={{
            padding: '8px 18px',
            borderRadius: '9999px',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#334155',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Volume2 size={16} color="#00A86B" /> Voice Sathi Companion
          </span>
          <span style={{
            padding: '8px 18px',
            borderRadius: '9999px',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#334155',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={16} color="#0284C7" /> 3-Tier Family Escalation
          </span>
          <span style={{
            padding: '8px 18px',
            borderRadius: '9999px',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#334155',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Smartphone size={16} color="#00A86B" /> 4-Digit Senior PIN
          </span>
          <span style={{
            padding: '8px 18px',
            borderRadius: '9999px',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#334155',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Lock size={16} color="#0284C7" /> Zero Plaintext Security
          </span>
        </div>

        {/* Floating Dual-Portal Showcase Card (Consulto / Surgico Glass Bento Style) */}
        <div className="glass-card" style={{
          borderRadius: '28px',
          maxWidth: '1180px',
          margin: '0 auto',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          textAlign: 'left'
        }}>
          {/* Senior Patient Side */}
          <div style={{
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid rgba(226, 232, 240, 0.8)',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F6FBF8 100%)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: '#E8F8EE',
                  color: '#00704A',
                  border: '1px solid #A7F3D0'
                }}>
                  SENIOR PATIENT PORTAL
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>High Contrast Mode</span>
              </div>

              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px', letterSpacing: '-0.02em' }}>
                Simple, Dignified Senior View
              </h2>
              <p style={{ fontSize: '0.98rem', color: '#64748B', lineHeight: 1.6, marginBottom: '24px' }}>
                Designed specifically for aging eyes and one-touch interaction. Large targets, high contrast, and zero confusion.
              </p>

              {/* Patient Mock Card */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '16px 20px',
                marginBottom: '26px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Metformin 500mg</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#FEF3C7', color: '#92400E' }}>
                    Due 8:00 AM
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '12px' }}>Take 1 tablet with warm water after breakfast</div>
                <div style={{
                  padding: '10px 16px',
                  backgroundColor: '#E8F8EE',
                  borderRadius: '10px',
                  color: '#00704A',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Volume2 size={16} color="#00A86B" />
                  <span>Audio read aloud available</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.94rem', color: '#334155', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#00A86B" style={{ flexShrink: 0 }} />
                  <span>One-touch 4-digit PIN access (no passwords to forget)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.94rem', color: '#334155', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#00A86B" style={{ flexShrink: 0 }} />
                  <span>Natural Sathi Voice Companion for daily routine guidance</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.94rem', color: '#334155', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#00A86B" style={{ flexShrink: 0 }} />
                  <span>Senior-controlled caregiver permissions with instant revoke</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setModalRole('ELDER')}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: '14px',
                backgroundColor: '#00A86B',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1.02rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 18px rgba(0, 168, 107, 0.25)',
                cursor: 'pointer'
              }}
            >
              <span>Enter Senior Patient Portal</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Caretaker & Family Side */}
          <div style={{
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFD 100%)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: '#E0F2FE',
                  color: '#0284C7',
                  border: '1px solid #BAE6FD'
                }}>
                  CARE CIRCLE & FAMILY GUARDIAN
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Real-Time Sync</span>
              </div>

              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px', letterSpacing: '-0.02em' }}>
                Intelligent Safety Net
              </h2>
              <p style={{ fontSize: '0.98rem', color: '#64748B', lineHeight: 1.6, marginBottom: '24px' }}>
                Real-time visibility into medication adherence, doctor visits, and deterministic multi-tier escalation warnings.
              </p>

              {/* Caretaker Mock Card */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '16px 20px',
                marginBottom: '26px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Escalation Protocol</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#DCFCE7', color: '#15803D' }}>
                    Active &bull; Standby
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '12px' }}>
                  If morning dose is unconfirmed by 8:15 AM, primary caretaker is notified immediately.
                </div>
                <div style={{
                  padding: '10px 16px',
                  backgroundColor: '#F1F5F9',
                  borderRadius: '10px',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ShieldCheck size={16} color="#0284C7" />
                  <span>3 Family Members Linked in Care Circle</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.94rem', color: '#334155', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#0284C7" style={{ flexShrink: 0 }} />
                  <span>3-tier automated escalation for any unconfirmed dose</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.94rem', color: '#334155', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#0284C7" style={{ flexShrink: 0 }} />
                  <span>Gemini 2.0 AI schedule parser with human verification</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.94rem', color: '#334155', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#0284C7" style={{ flexShrink: 0 }} />
                  <span>Complete tamper-evident audit history of all doses & alerts</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setModalRole('CARETAKER')}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: '14px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1.02rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 18px rgba(15, 23, 42, 0.2)',
                cursor: 'pointer'
              }}
            >
              <span>Enter Caretaker Portal</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Bento Trust Metrics (Surgico Style) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
          maxWidth: '1180px',
          margin: '36px auto 0 auto'
        }}>
          <div className="glass-card" style={{
            padding: '20px 24px',
            borderRadius: '18px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#E8F8EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={24} color="#00A86B" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>100% Deterministic</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Mathematical cron guarantees alert dispatch</div>
            </div>
          </div>

          <div className="glass-card" style={{
            padding: '20px 24px',
            borderRadius: '18px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#E0F2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Lock size={22} color="#0284C7" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Zero-Plaintext PINs</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Bcrypt salted cryptographic security</div>
            </div>
          </div>

          <div className="glass-card" style={{
            padding: '20px 24px',
            borderRadius: '18px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={22} color="#D97706" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>5-Minute Expiry</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Single-use transactional verification</div>
            </div>
          </div>

          <div className="glass-card" style={{
            padding: '20px 24px',
            borderRadius: '18px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#F3E8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Heart size={22} color="#9333EA" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Elder Dignity</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Seniors control access & privacy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid (3 Cards in a Row on Desktop) + "Read More" Modal */}
      <section
        id="features-section"
        ref={sectionRef}
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 28px 60px 28px',
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}
        className={`scroll-reveal ${isSectionRevealed ? 'is-revealed' : ''}`}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{
            display: 'inline-block',
            fontSize: '0.78rem',
            fontWeight: 800,
            padding: '4px 14px',
            borderRadius: '9999px',
            backgroundColor: '#E8F8EE',
            color: '#00704A',
            border: '1px solid #A7F3D0',
            marginBottom: '10px'
          }}>
            CORE ARCHITECTURE
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em' }}>
            Built for Independence, Safety, and Trust
          </h2>
          <p style={{ fontSize: '1.02rem', color: '#64748B', marginTop: '8px' }}>
            Explore how SehatSathi solves elder medication adherence gracefully.
          </p>
        </div>

        {/* 3 Columns in a Row on Desktop */}
        <div className="feature-grid-3">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="glass-card animate-card"
              style={{
                borderRadius: '20px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: '#E8F8EE',
                  color: '#00704A',
                  display: 'inline-block',
                  marginBottom: '14px',
                  border: '1px solid #A7F3D0'
                }}>
                  {feat.badge}
                </span>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                  {feat.title}
                </h3>

                <p style={{ fontSize: '0.94rem', color: '#64748B', lineHeight: 1.6, marginBottom: '22px' }}>
                  {feat.shortDesc}
                </p>
              </div>

              {/* Read More Button */}
              <button
                onClick={() => setActiveFeatureModal(feat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#00A86B',
                  padding: '4px 0',
                  alignSelf: 'flex-start',
                  cursor: 'pointer'
                }}
              >
                <span>Read More</span>
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Escalation Workflow Banner - Connected 3-Stage Pipeline */}
      <section
        id="escalation-section"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 28px 64px 28px',
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div className="glass-card" style={{
          borderRadius: '24px',
          padding: '48px 40px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '4px 14px',
              borderRadius: '9999px',
              backgroundColor: '#E8F8EE',
              color: '#00704A',
              border: '1px solid #A7F3D0',
              marginBottom: '10px'
            }}>
              VERIFIED ESCALATION CHAIN
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.025em' }}>
              Multi-Tier Safety Escalation Pipeline
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748B', maxWidth: '680px', margin: '0 auto' }}>
              Pure mathematical time evaluation guarantees zero missed doses and zero duplicate notifications.
            </p>
          </div>

          {/* Connected 3-Stage Pipeline */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: '24px'
          }}>
            {/* Stage 1 */}
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #A7F3D0',
              borderRadius: '18px',
              padding: '26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0, 168, 107, 0.06)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#00A86B',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.95rem'
                  }}>
                    01
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#DCFCE7', color: '#15803D' }}>
                    00:00 (Due Time)
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#004D34', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BellRing size={18} color="#00A86B" />
                  <span>Patient PWA Audio Prompt</span>
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#166534', lineHeight: 1.55 }}>
                  Immediate audio chime & high-contrast on-screen prompt on senior’s phone. A single tap confirms medication taken.
                </p>
              </div>
              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #BBF7D0', fontSize: '0.82rem', fontWeight: 700, color: '#15803D' }}>
                &bull; Primary Actor: Senior Citizen Direct
              </div>
            </div>

            {/* Stage 2 */}
            <div style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '18px',
              padding: '26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.06)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.95rem'
                  }}>
                    02
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#FEF3C7', color: '#92400E' }}>
                    +15 Min Grace Expired
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#78350F', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#D97706" />
                  <span>Primary Caretaker Alert</span>
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#92400E', lineHeight: 1.55 }}>
                  High-priority email notification dispatched to designated primary caregiver with instant phone check-in prompt.
                </p>
              </div>
              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #FCD34D', fontSize: '0.82rem', fontWeight: 700, color: '#92400E' }}>
                &bull; Idempotent: 1 alert per missed window
              </div>
            </div>

            {/* Stage 3 */}
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '18px',
              padding: '26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.06)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.95rem'
                  }}>
                    03
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                    +30 Min Critical Alert
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7F1D1D', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PhoneCall size={18} color="#DC2626" />
                  <span>Extended Family Circle</span>
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#991B1B', lineHeight: 1.55 }}>
                  Full emergency escalation to all linked family members, emergency contacts, and recorded clinical providers.
                </p>
              </div>
              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #FCA5A5', fontSize: '0.82rem', fontWeight: 700, color: '#991B1B' }}>
                &bull; Full Audit Log: Recorded immutably
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Minimalist Modern Footer (Consulto / Surgico style) */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid rgba(226, 232, 240, 0.9)',
        padding: '36px 48px',
        color: '#0F172A',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src="/logo.png"
              alt="SehatSathi Logo"
              style={{ width: '42px', height: '42px', objectFit: 'contain' }}
            />
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', display: 'block', lineHeight: 1.1 }}>
                SehatSathi
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
                Dignified Senior Care &bull; Prompt Wars X Catalyst 2026
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowPrivacyModal(true)}
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              Safety & Privacy
            </button>
            <button
              onClick={() => setModalRole('ELDER')}
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#00A86B',
                cursor: 'pointer'
              }}
            >
              Senior Portal
            </button>
            <button
              onClick={() => setModalRole('CARETAKER')}
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#0F172A',
                cursor: 'pointer'
              }}
            >
              Caregiver Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Safety & Privacy Specification Modal */}
      {showPrivacyModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPrivacyModal(false);
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
            padding: '20px',
            zIndex: 1200
          }}
        >
          <div 
            className="no-scrollbar"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '720px',
              width: '100%',
              padding: '32px 36px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(226, 232, 240, 0.95)',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <span style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: '#E8F8EE',
                  color: '#00704A',
                  display: 'inline-block',
                  marginBottom: '8px',
                  border: '1px solid #A7F3D0'
                }}>
                  PATIENT PROTECTION & PRIVACY GUARANTEE
                </span>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  Safety & Privacy First
                </h2>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                style={{
                  padding: '6px',
                  color: '#64748B',
                  borderRadius: '50%',
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Well-Structured 2-Column Bento Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
              marginTop: '16px'
            }}>
              {/* Card 1 */}
              <div style={{
                padding: '16px 18px',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#E8F8EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <KeyRound size={18} color="#00A86B" />
                  </div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Elder-Controlled Access</h4>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Seniors generate a private Patient Link Code. Caregivers cannot access without explicit permission, and seniors can revoke access anytime with one tap.
                </p>
              </div>

              {/* Card 2 */}
              <div style={{
                padding: '16px 18px',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Lock size={18} color="#0284C7" />
                  </div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Zero-Plaintext Hashing</h4>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Senior PINs and caregiver passwords are encrypted with 10 salt rounds of Bcrypt. Raw credentials are never stored or exposed in plaintext.
                </p>
              </div>

              {/* Card 3 */}
              <div style={{
                padding: '16px 18px',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={18} color="#D97706" />
                  </div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>5-Minute Single-Use OTP</h4>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  All email verification codes automatically expire after 5 minutes and are destroyed upon single verification to eliminate replay attacks.
                </p>
              </div>

              {/* Card 4 */}
              <div style={{
                padding: '16px 18px',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={18} color="#9333EA" />
                  </div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Brute-Force Lockout</h4>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  60-second cooldown timer prevents email spamming, and automatic 15-minute account lockouts trigger after 5 consecutive failed attempts.
                </p>
              </div>

              {/* Card 5 - Full Width Span */}
              <div style={{
                gridColumn: '1 / -1',
                padding: '16px 20px',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <Eye size={18} color="#15803D" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Tamper-Evident Medical Audit Trail</h4>
                  <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                    Every dose marked taken, doctor appointment scheduled, or safety alert dispatched is permanently logged with an authentic timestamp and actor identity.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              style={{
                marginTop: '22px',
                width: '100%',
                padding: '13px 0',
                borderRadius: '12px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.96rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal for Feature "Read More" */}
      {activeFeatureModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveFeatureModal(null);
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
            padding: '20px',
            zIndex: 1100
          }}
        >
          <div 
            className="no-scrollbar"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '32px',
              border: '1px solid rgba(226, 232, 240, 0.95)',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  backgroundColor: '#E8F8EE',
                  color: '#00704A',
                  display: 'inline-block',
                  marginBottom: '6px',
                  border: '1px solid #A7F3D0'
                }}>
                  {activeFeatureModal.badge}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {activeFeatureModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveFeatureModal(null)}
                style={{ padding: '6px', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {activeFeatureModal.fullDesc.map((point, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#00A86B" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.94rem', color: '#334155', lineHeight: 1.55, margin: 0 }}>
                    {point}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveFeatureModal(null)}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '12px 0',
                borderRadius: '12px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {modalRole && (
        <AuthModal
          initialRole={modalRole}
          isOpen={true}
          onClose={() => setModalRole(null)}
          onSuccess={onLoginSuccess}
        />
      )}
    </div>
  );
};
