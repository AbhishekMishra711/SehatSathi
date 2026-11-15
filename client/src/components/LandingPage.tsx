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
  Smartphone,
  Mail
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
      title: 'Elder mobile screen',
      badge: 'Elder access',
      shortDesc: 'Large buttons, high contrast, and a 4-digit PIN for seniors.',
      fullDesc: [
        'Designed for phone screens with 48px or larger touch targets.',
        'One primary action per screen with high-contrast text.',
        'Protected by PIN hashing and a 15-minute lockout after 5 failed attempts.',
        'Speech button reads the medication name, dose, and instructions aloud.'
      ]
    },
    {
      title: 'Voice and text companion',
      badge: 'Assistant',
      shortDesc: 'Answers questions about scheduled medicines, visits, and meals.',
      fullDesc: [
        'Elders can speak or type questions about their schedule.',
        'Reads the senior\'s active medicines and upcoming appointments.',
        'Does not recommend unlisted medicines and sticks to daily routines.',
        'Audio playback reads each response aloud.'
      ]
    },
    {
      title: 'Escalation chain',
      badge: 'Email alerts',
      shortDesc: 'Emails caretakers and family if a scheduled dose is missed.',
      fullDesc: [
        'Three-stage escalation: elder reminder first, then primary caretaker alert, then family alert.',
        'Runs on an automated schedule without sending duplicate emails.',
        'Evaluates whether each dose is taken or overdue based on scheduled time and grace periods.',
        'Includes a test button in the caretaker dashboard to verify alerts.'
      ]
    },
    {
      title: 'Elder-controlled access',
      badge: 'Access control',
      shortDesc: 'The elder decides which family members can view or edit medicines.',
      fullDesc: [
        'Elders generate a 6-digit code to connect family members.',
        'The elder can grant view-only or editing permissions.',
        'One tap removes access for any linked account.',
        'Activity logs show the elder who accessed the account.'
      ]
    },
    {
      title: 'Prescription helper',
      badge: 'Prescription helper',
      shortDesc: 'Extracts schedules from prescription text for caretaker review.',
      fullDesc: [
        'Paste doctor notes or prescription instructions.',
        'Extracts medication name, dosage, frequency, and time slots.',
        'Caretaker reviews and approves each item before saving.',
        'Saves the verified schedule to the elder\'s daily list.'
      ]
    },
    {
      title: 'Log of every change',
      badge: 'Activity log',
      shortDesc: 'Records who confirmed doses, modified medicines, or received alerts.',
      fullDesc: [
        'Every dose marked as taken or missed is recorded with a timestamp.',
        'Shows whether the elder or a caretaker confirmed the dose.',
        'Logs cannot be edited or deleted by non-admin users.',
        'Provides an accurate record of medication history.'
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
      {/* Full-Width Clean Modern Navbar (Medico Reference Style) */}
      <nav className="landing-nav" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)',
        padding: '16px 56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px'
      }}>
        {/* Brand Logo & Editorial Typography */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/logo.png"
            alt="SehatSathi Care Logo"
            className="animate-logo-entrance logo-pulse"
            style={{
              width: '44px',
              height: '44px',
              objectFit: 'contain'
            }}
          />
          <div className="animate-title-slide">
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.025em',
              display: 'block',
              lineHeight: 1.1
            }}>
              SehatSathi
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#00AC73',
              letterSpacing: '0.8px'
            }}>
              SENIOR MEDICATION CARE
            </span>
          </div>
        </div>

        {/* Center Minimal Navigation Links */}
        <div className="landing-nav-links" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px'
        }}>
          <button
            onClick={() => {
              const el = document.getElementById('features-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              fontSize: '0.94rem',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0F172A')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
          >
            Features
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('escalation-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              fontSize: '0.94rem',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0F172A')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
          >
            Escalation Protocol
          </button>
          <button
            onClick={() => setShowPrivacyModal(true)}
            style={{
              fontSize: '0.94rem',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0F172A')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
          >
            Safety & Privacy
          </button>
        </div>

        {/* Action CTAs */}
        <div className="landing-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setModalRole('ELDER')}
            className="landing-nav-btn"
            style={{
              padding: '10px 22px',
              borderRadius: '9999px',
              backgroundColor: '#E8F8EE',
              border: '1px solid #A7F3D0',
              color: '#00875A',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer'
            }}
          >
            Elder login
          </button>

          <button
            onClick={() => setModalRole('CARETAKER')}
            className="landing-nav-btn"
            style={{
              padding: '10px 24px',
              borderRadius: '9999px',
              backgroundColor: '#00AC73',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 172, 115, 0.25)'
            }}
          >
            <span>Family and caretaker login</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section: Modern, Breathable & Editorial with Comfortable Side Whitespace */}
      <section style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '52px 28px 44px 28px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        width: '100%'
      }} className="animate-hero landing-hero">
        
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
          <span>Elderly care and medication management</span>
        </div>

        {/* Editorial Modern Headline */}
        <h1 className="landing-hero-title" style={{
          fontSize: 'clamp(2.4rem, 4.8vw, 3.8rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: '#0F172A',
          maxWidth: '980px',
          margin: '0 auto 18px auto'
        }}>
          Medicine reminders that tell the family when a dose is missed.
        </h1>

        {/* Humanized Subtext */}
        <p className="landing-hero-desc" style={{
          fontSize: '1.16rem',
          fontWeight: 500,
          color: '#64748B',
          maxWidth: '780px',
          margin: '0 auto 34px auto',
          lineHeight: 1.65
        }}>
          The elder taps once to confirm each dose. If they don’t, the caretaker gets an email, then the rest of the family. The elder decides who can see what.
        </p>

        {/* Plain Factual Feature Chips */}
        <div className="landing-hero-chips" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '42px'
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
            <Mail size={16} color="#00AC73" /> Email reminders
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
            <ShieldCheck size={16} color="#0284C7" /> Escalation to caretaker, then family
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
            <KeyRound size={16} color="#00AC73" /> Elder controls who can see what
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
            <Eye size={16} color="#0284C7" /> Log of every change
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
            <Volume2 size={16} color="#00AC73" /> Reads the next dose aloud
          </span>
        </div>

        {/* Uncluttered Dual-Portal Console (High Visual Hierarchy, Zero Nested Clutter) */}
        <div className="glass-card landing-portal-grid" style={{
          borderRadius: '24px',
          maxWidth: '1140px',
          margin: '0 auto',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          textAlign: 'left'
        }}>
          {/* Senior Elder Side */}
          <div style={{
            padding: '44px 38px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid rgba(226, 232, 240, 0.8)',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F6FBF8 100%)'
          }}>
            <div>
              <div style={{ marginBottom: '14px' }}>
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
                  ELDER PORTAL
                </span>
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px', letterSpacing: '-0.025em' }}>
                Elder screen
              </h2>
              <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.6, marginBottom: '28px' }}>
                Large buttons and high contrast. The elder taps once to mark a dose as taken.
              </p>

              {/* Clean, Non-Overwhelming Feature Points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '34px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E8F8EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Smartphone size={18} color="#00AC73" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>4-digit PIN login</h4>
                    <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>The elder logs in with a 4-digit PIN. Five wrong attempts locks the account for 15 minutes.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E8F8EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Volume2 size={18} color="#00AC73" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>Reads doses aloud</h4>
                    <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>The elder can tap to hear the medicine name, dose, and instructions read out loud.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E8F8EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <ShieldCheck size={18} color="#00AC73" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>Elder controls access</h4>
                    <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>The elder shares a 6-digit link code with family to connect, and can remove access at any time.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setModalRole('ELDER')}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: '12px',
                backgroundColor: '#00AC73',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1.02rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 18px rgba(0, 172, 115, 0.25)',
                cursor: 'pointer'
              }}
            >
              <span>Enter elder portal</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Caretaker & Family Side */}
          <div style={{
            padding: '44px 38px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFD 100%)'
          }}>
            <div>
              <div style={{ marginBottom: '14px' }}>
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
                  FAMILY AND CARETAKER
                </span>
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px', letterSpacing: '-0.025em' }}>
                Caretaker dashboard
              </h2>
              <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.6, marginBottom: '28px' }}>
                Add medications, set times, track taken doses, and receive email alerts if a dose is missed.
              </p>

              {/* Clean, Non-Overwhelming Feature Points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '34px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <AlertTriangle size={18} color="#0284C7" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>Escalation alerts</h4>
                    <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>If a dose is not confirmed within the grace window, an email alert is sent to the caretaker.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Eye size={18} color="#0284C7" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>Prescription helper</h4>
                    <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>Fill in medication details from prescription notes. The caretaker reviews and approves each item before saving.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Clock size={18} color="#0284C7" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>Log of every change</h4>
                    <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>Every dose confirmed, schedule change, and alert sent is recorded with a timestamp.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setModalRole('CARETAKER')}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: '12px',
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
              <span>Enter family and caretaker portal</span>
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
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Scheduled checks</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Checks every minute for missed doses</div>
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
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Hashed credentials</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>PINs and passwords stored with Bcrypt</div>
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
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>5-minute code expiry</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Email verification codes expire after 5 minutes</div>
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
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Elder controls access</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Seniors decide who can see what</div>
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
            HOW IT WORKS
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em' }}>
            Features built for elders and families
          </h2>
          <p style={{ fontSize: '1.02rem', color: '#64748B', marginTop: '8px' }}>
            Simple screens for the elder, with automatic email alerts for the family.
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
                <span>Read more</span>
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
              ESCALATION SCHEDULE
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.025em' }}>
              Three-stage escalation pipeline
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748B', maxWidth: '680px', margin: '0 auto' }}>
              Calculates missed doses based on scheduled times and grace periods.
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
                  <span>Elder phone reminder</span>
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#166534', lineHeight: 1.55 }}>
                  An on-screen prompt and read-aloud option appear on the elder's phone. One tap confirms the dose.
                </p>
              </div>
              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #BBF7D0', fontSize: '0.82rem', fontWeight: 700, color: '#15803D' }}>
                &bull; Actor: Elder
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
                    +15 min grace window
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#78350F', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#D97706" />
                  <span>Primary caretaker alert</span>
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#92400E', lineHeight: 1.55 }}>
                  If the dose is not confirmed within 15 minutes, an email is sent to the primary caretaker.
                </p>
              </div>
              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #FCD34D', fontSize: '0.82rem', fontWeight: 700, color: '#92400E' }}>
                &bull; Actor: Primary caretaker
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
                    +30 min second grace window
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7F1D1D', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PhoneCall size={18} color="#DC2626" />
                  <span>Family alert</span>
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#991B1B', lineHeight: 1.55 }}>
                  If still unconfirmed after a second grace period, an email is sent to all linked family members.
                </p>
              </div>
              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #FCA5A5', fontSize: '0.82rem', fontWeight: 700, color: '#991B1B' }}>
                &bull; Actor: Family members
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
                Senior medication reminders &bull; Prompt Wars X Catalyst 2026
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
              Elder login
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
              Family and caretaker login
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
                  ELDER PRIVACY AND SECURITY
                </span>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  Safety & privacy
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
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Elder-controlled access</h4>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Seniors generate a 6-digit link code. Family cannot access without permission, and seniors can revoke access at any time with one tap.
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
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Hashed credentials</h4>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Senior PINs and caregiver passwords are encrypted with Bcrypt. Plaintext credentials are never stored.
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
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>5-minute code expiry</h4>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Email verification codes expire after 5 minutes and are deleted upon verification.
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
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>15-minute account lockout</h4>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  A 60-second timer limits email sends, and an automatic 15-minute lockout triggers after 5 failed attempts.
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
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Log of every change</h4>
                  <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                    Every dose marked as taken, appointment scheduled, or email alert dispatched is recorded with a timestamp.
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
