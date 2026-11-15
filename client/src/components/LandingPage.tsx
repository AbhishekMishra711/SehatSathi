import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { AuthModal } from './AuthModal';
import { 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  MessageSquare,
  ArrowRight,
  Lock,
  X,
  ChevronRight,
  Shield,
  BellRing,
  AlertTriangle,
  PhoneCall
} from 'lucide-react';

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
  const [showKnowMoreModal, setShowKnowMoreModal] = useState(false);

  // Persistent Scroll Reveal Observer
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isSectionRevealed, setIsSectionRevealed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsSectionRevealed(true);
          observer.disconnect(); // Persistent once loaded!
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
      shortDesc: 'Extra-large touch targets and simple 4-digit PIN authentication designed for seniors.',
      fullDesc: [
        'Built specifically for aging eyes and one-thumb navigation on any smartphone.',
        'Uses an accessible high-contrast palette with 48px+ touch targets and a single primary action per screen.',
        'Protected by Argon2/Bcrypt PIN hashing and automatic 15-minute account lockout after 5 failed attempts.',
        'Includes browser-native speech synthesis to read dosage and instructions aloud for low-vision patients.'
      ]
    },
    {
      title: 'AI Voice & Health Companion',
      badge: 'Sathi AI',
      shortDesc: 'A natural voice and chat companion strictly bounded to the patient’s medications and diet.',
      fullDesc: [
        'Seniors can speak directly into their smartphone microphone or type natural questions.',
        'Live contextual awareness: Knows the patient’s exact medications for today, doctor appointments, and medical notes.',
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
        'Senior citizens remain at the center of their own healthcare decisions.',
        'Each senior receives a unique Patient Link Code to share with trusted caregivers.',
        'Seniors can grant or restrict medication editing and doctor visit management per caregiver.',
        'Access can be revoked with a single tap directly from the senior’s device.'
      ]
    },
    {
      title: 'Gemini Schedule Parser',
      badge: 'Verified AI',
      shortDesc: 'Turns messy prescription sentences into structured schedules with human verification.',
      fullDesc: [
        'Converts natural text like "1 Metformin tablet after breakfast and dinner for 2 weeks" into daily time slots.',
        'Validated against a strict Zod schema before displaying.',
        'Safe AI policy: AI outputs are always presented as recommendations that must be verified by the caretaker before saving.',
        'Eliminates manual scheduling errors while keeping human judgment in full control.'
      ]
    },
    {
      title: 'Tamper-Evident Audit Trail',
      badge: 'Accountability',
      shortDesc: 'Complete transparency: logs who confirmed doses, modified meds, or received alerts.',
      fullDesc: [
        'Every single action is logged with an immutable timestamp and the actor’s identity.',
        'Caregivers and family members can view historical adherence trends and timing accuracy.',
        'Builds mutual trust between senior citizens, their children, and visiting nurses.',
        'Available in both caregiver dashboard and master admin console.'
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Banner Navigation: Prominent, Spacious, Emerald Green Background (#009F6B & #9BE5AA) */}
      <nav style={{
        backgroundColor: '#009F6B',
        borderBottom: '4px solid #9BE5AA',
        padding: '24px 44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 8px 25px rgba(0, 159, 107, 0.28)'
      }}>
        {/* User-Provided Hands-Heart Logo and Brand Name with animated entrance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <img
            src="/logo.png"
            alt="SehatSathi Care Logo"
            className="animate-logo-entrance logo-pulse"
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))'
            }}
          />
          <div className="animate-title-slide">
            <span style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.025em',
              display: 'block',
              lineHeight: 1.1
            }}>
              SehatSathi
            </span>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#9BE5AA',
              letterSpacing: '1.2px'
            }}>
              DIGNIFIED SENIOR CARE &bull; HEALTH PLATFORM
            </span>
          </div>
        </div>

        {/* Action Buttons: Know More, Patient, and Caretaker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowKnowMoreModal(true)}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.94rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={18} color="#9BE5AA" />
            <span>Architecture & Security</span>
          </button>

          <button
            onClick={() => setModalRole('ELDER')}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#9BE5AA',
              color: '#004D34',
              fontWeight: 800,
              fontSize: '0.98rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            Patient
          </button>

          <button
            onClick={() => setModalRole('CARETAKER')}
            style={{
              padding: '12px 26px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#FFFFFF',
              color: '#009F6B',
              fontWeight: 800,
              fontSize: '0.98rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)'
            }}
          >
            <span>Caretaker / Family</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </nav>

      {/* Hero Section with High-Contrast Typography & Unified Dual-Portal Console */}
      <section style={{
        maxWidth: '1140px',
        margin: '0 auto',
        padding: '56px 20px 48px 20px',
        textAlign: 'center'
      }} className="animate-hero">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          borderRadius: '30px',
          backgroundColor: '#E8F8EE',
          color: '#009F6B',
          fontSize: '0.92rem',
          fontWeight: 800,
          marginBottom: '26px',
          border: '1px solid #9BE5AA',
          boxShadow: '0 2px 8px rgba(155, 229, 170, 0.4)'
        }}>
          <ShieldCheck size={19} color="#009F6B" />
          <span>Patient-Centered Elderly Care & Medication Management</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.7rem, 6.2vw, 4.2rem)',
          fontWeight: 800,
          letterSpacing: '-0.035em',
          lineHeight: 1.12,
          maxWidth: '920px',
          margin: '0 auto 22px auto'
        }}>
          <span style={{ color: 'var(--c-deep-ocean)', display: 'block' }}>
            Dignified Healthcare for Seniors.
          </span>
          <span style={{ color: '#009F6B', display: 'block' }}>
            Peace of Mind for Families.
          </span>
        </h1>

        <p style={{
          fontSize: '1.25rem',
          fontWeight: 500,
          color: 'var(--text-muted)',
          maxWidth: '760px',
          margin: '0 auto 40px auto',
          lineHeight: 1.6
        }}>
          SehatSathi empowers seniors with an accessible, high-contrast mobile interface, voice audio assistant, 
          and an intelligent escalation chain that keeps family notified when doses are missed.
        </p>

        {/* Unified Dual-Portal Console with Invisible Partition */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid var(--border-color)',
          boxShadow: '0 12px 30px -10px rgba(0, 159, 107, 0.12)',
          maxWidth: '880px',
          margin: '0 auto',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
        }}>
          {/* Senior Patient Side */}
          <div style={{
            padding: '36px 32px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid var(--border-color)',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FCF9 100%)'
          }}>
            <div>
              <span style={{
                display: 'inline-block',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '12px',
                backgroundColor: '#9BE5AA',
                color: '#004D34',
                marginBottom: '14px'
              }}>
                SENIOR PATIENT PORTAL
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '10px' }}>
                Simple, Dignified Senior View
              </h2>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                Designed specifically for aging eyes and simple touch. No complex forms or confusing steps.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#009F6B" />
                  <span>One-touch 4-digit PIN access</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#009F6B" />
                  <span>Sathi Voice & Audio Assistant for medications</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#009F6B" />
                  <span>Full control to grant or revoke caretaker links</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setModalRole('ELDER')}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: '10px',
                backgroundColor: '#009F6B',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 159, 107, 0.35)'
              }}
            >
              <span>Enter as Senior Patient</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Caretaker & Family Side */}
          <div style={{
            padding: '36px 32px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFD 100%)'
          }}>
            <div>
              <span style={{
                display: 'inline-block',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '12px',
                backgroundColor: '#DCFCE7',
                color: '#009F6B',
                marginBottom: '14px'
              }}>
                CARE CIRCLE & FAMILY
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '10px' }}>
                Intelligent Safety Net
              </h2>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                Real-time visibility into medication adherence, doctor visits, and multi-tier escalation warnings.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#009F6B" />
                  <span>3-tier automated missed dose escalation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#009F6B" />
                  <span>Gemini-powered prescription schedule parser</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#009F6B" />
                  <span>Complete tamper-evident audit history</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setModalRole('CARETAKER')}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: '10px',
                backgroundColor: 'var(--c-deep-ocean)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(24, 78, 119, 0.25)'
              }}
            >
              <span>Enter as Caretaker / Family</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid (3 Cards in a Row on Desktop) + "Read More" Modal */}
      <section
        ref={sectionRef}
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          padding: '24px 20px 60px 20px'
        }}
        className={`scroll-reveal ${isSectionRevealed ? 'is-revealed' : ''}`}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--c-deep-ocean)', letterSpacing: '-0.02em' }}>
            Built for Independence, Safety, and Trust
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Explore how SehatSathi solves elder medication challenges seamlessly.
          </p>
        </div>

        {/* 3 Columns in a Row on Desktop */}
        <div className="feature-grid-3">
          {features.map((feat, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              className="animate-card"
            >
              <div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  backgroundColor: '#E8F8EE',
                  color: '#009F6B',
                  display: 'inline-block',
                  marginBottom: '12px',
                  border: '1px solid #9BE5AA'
                }}>
                  {feat.badge}
                </span>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '8px' }}>
                  {feat.title}
                </h3>

                <p style={{ fontSize: '0.93rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
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
                  fontWeight: 800,
                  color: '#009F6B',
                  padding: '6px 0',
                  alignSelf: 'flex-start'
                }}
              >
                <span>Read More</span>
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Escalation Workflow Banner - Redesigned Connected Pipeline */}
      <section style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '0 20px 60px 20px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid var(--border-color)',
          borderRadius: '20px',
          padding: '44px 36px',
          boxShadow: '0 12px 32px -8px rgba(0, 159, 107, 0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '4px 14px',
              borderRadius: '20px',
              backgroundColor: '#F0FDF4',
              color: '#009F6B',
              border: '1px solid #9BE5AA',
              marginBottom: '10px'
            }}>
              VERIFIED DETERMINISTIC PROTOCOL
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '8px' }}>
              Multi-Tier Safety Escalation Pipeline
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto' }}>
              Pure mathematical time evaluation guarantees zero missed doses and zero duplicate notifications.
            </p>
          </div>

          {/* Connected 3-Stage Pipeline */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {/* Stage 1 */}
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '2px solid #00AC73',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0, 172, 115, 0.08)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#00AC73',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.95rem'
                  }}>
                    01
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#15803D' }}>
                    00:00 (Due Time)
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#004D34', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BellRing size={20} color="#00AC73" />
                  <span>Patient PWA Audio Prompt</span>
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#166534', lineHeight: 1.5 }}>
                  Immediate audio chime & high-contrast on-screen prompt on senior’s phone. A single tap confirms medication taken.
                </p>
              </div>
              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #BBF7D0', fontSize: '0.8rem', fontWeight: 700, color: '#15803D' }}>
                &bull; Primary Actor: Senior Citizen Direct
              </div>
            </div>

            {/* Stage 2 */}
            <div style={{
              backgroundColor: '#FEF3C7',
              border: '2px solid #D97706',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.08)'
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
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', backgroundColor: '#FDE68A', color: '#92400E' }}>
                    +15 Min Grace Expired
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#78350F', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={20} color="#D97706" />
                  <span>Primary Caretaker Alert</span>
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#92400E', lineHeight: 1.5 }}>
                  High-priority email notification dispatched to designated primary caregiver with instant phone check-in prompt.
                </p>
              </div>
              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #FCD34D', fontSize: '0.8rem', fontWeight: 700, color: '#92400E' }}>
                &bull; Idempotent: 1 alert per missed window
              </div>
            </div>

            {/* Stage 3 */}
            <div style={{
              backgroundColor: '#FEE2E2',
              border: '2px solid #DC2626',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)'
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
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', backgroundColor: '#FECACA', color: '#991B1B' }}>
                    +30 Min Critical Alert
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7F1D1D', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PhoneCall size={20} color="#DC2626" />
                  <span>Extended Family Circle</span>
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#991B1B', lineHeight: 1.5 }}>
                  Full emergency escalation to all linked family members, emergency contacts, and recorded clinical providers.
                </p>
              </div>
              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #FCA5A5', fontSize: '0.8rem', fontWeight: 700, color: '#991B1B' }}>
                &bull; Full Audit Log: Recorded immutably
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Palette-Themed #009F6B Background (Same as Header) */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: '#009F6B',
        borderTop: '4px solid #9BE5AA',
        padding: '36px 40px',
        color: '#FFFFFF'
      }}>
        <div style={{
          maxWidth: '1180px',
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
              style={{ width: '44px', height: '44px', objectFit: 'contain' }}
            />
            <div>
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', display: 'block', lineHeight: 1.1 }}>
                SehatSathi
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9BE5AA' }}>
                Dignified Senior Care &bull; Prompt Wars X Catalyst 2026
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowKnowMoreModal(true)}
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                color: '#FFFFFF',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Architecture & Security
            </button>
            <button
              onClick={() => setModalRole('ELDER')}
              style={{
                fontSize: '0.92rem',
                fontWeight: 800,
                color: '#9BE5AA',
                cursor: 'pointer'
              }}
            >
              Senior Portal
            </button>
            <button
              onClick={() => setModalRole('CARETAKER')}
              style={{
                fontSize: '0.92rem',
                fontWeight: 800,
                color: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              Caregiver Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Know More / Architecture & Security Modal */}
      {showKnowMoreModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 77, 52, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1200
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            maxWidth: '680px',
            width: '100%',
            padding: '34px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '2px solid #00AC73',
            boxShadow: '0 25px 50px -12px rgba(0, 159, 107, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '12px',
                  backgroundColor: '#DCFCE7',
                  color: '#009F6B',
                  display: 'inline-block',
                  marginBottom: '8px'
                }}>
                  SECURITY & ARCHITECTURE SPECIFICATION
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--c-deep-ocean)', margin: 0 }}>
                  Know More About SehatSathi
                </h2>
              </div>
              <button
                onClick={() => setShowKnowMoreModal(false)}
                style={{ padding: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}
                aria-label="Close dialog"
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Security Safeguards */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#009F6B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} />
                  <span>Production-Grade Security Safeguards</span>
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  <li><strong>Bcrypt Password & PIN Hashing:</strong> Elder 4-digit PINs and caregiver credentials hashed with 10 salt rounds; no plaintext stored.</li>
                  <li><strong>Time-Bound 5-Minute OTPs:</strong> Single-use cryptographic verification codes strictly expire after 5 minutes.</li>
                  <li><strong>60-Second Cooldown & Rate Limiting:</strong> Enforces 60-second cooldown on OTP re-dispatches and limits failed attempts.</li>
                  <li><strong>Account Lockout:</strong> Automatically freezes authentication for 15 minutes after 5 consecutive failed login attempts.</li>
                  <li><strong>Tamper-Evident Audit Logs:</strong> Immutable timestamped logging of every dose confirmation, reschedule, and alert dispatch.</li>
                </ul>
              </div>

              {/* Technology Stack */}
              <div style={{ backgroundColor: '#F0FDF4', padding: '20px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#004D34', marginBottom: '10px' }}>
                  Underlying Tech Stack & Services
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                  <div><strong>Frontend:</strong> React 18, TypeScript, Vite, Plus Jakarta Sans</div>
                  <div><strong>Backend:</strong> Node.js, Express 5, Prisma ORM</div>
                  <div><strong>Database:</strong> Neon Serverless PostgreSQL</div>
                  <div><strong>AI Engine:</strong> Google Gemini 2.0 (gemini-flash-lite)</div>
                  <div><strong>Email Delivery:</strong> Nodemailer Gmail SMTP + Resend API</div>
                  <div><strong>Architecture:</strong> Fully Idempotent Deterministic Cron</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowKnowMoreModal(false)}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '14px 0',
                borderRadius: '10px',
                backgroundColor: '#009F6B',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1rem',
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 77, 52, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1100
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            border: '2px solid #00AC73',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  backgroundColor: '#E8F8EE',
                  color: '#009F6B',
                  display: 'inline-block',
                  marginBottom: '6px',
                  border: '1px solid #9BE5AA'
                }}>
                  {activeFeatureModal.badge}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--c-deep-ocean)', margin: 0 }}>
                  {activeFeatureModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveFeatureModal(null)}
                style={{ padding: '6px', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              {activeFeatureModal.fullDesc.map((point, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#009F6B" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
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
                borderRadius: '8px',
                backgroundColor: '#009F6B',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.95rem'
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
