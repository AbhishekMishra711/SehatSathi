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
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

interface FeatureDetail {
  title: string;
  badge: string;
  shortDesc: string;
  fullDesc: string[];
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [modalRole, setModalRole] = useState<'ELDER' | 'CARETAKER' | 'ADMIN' | null>(null);
  const [activeFeatureModal, setActiveFeatureModal] = useState<FeatureDetail | null>(null);

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
      {/* Top Banner Navigation */}
      <nav style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '2px solid var(--c-mint)',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(24, 78, 119, 0.05)'
      }}>
        {/* Logo and Brand Name with animated entrance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="animate-fade-in">
          <img
            src="/logo.svg"
            alt="SehatSathi Care Logo"
            className="logo-pulse"
            style={{ width: '42px', height: '42px', objectFit: 'contain' }}
          />
          <div>
            <span style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--c-deep-ocean)',
              letterSpacing: '-0.02em',
              display: 'block',
              lineHeight: 1.1
            }}>
              SehatSathi
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--c-teal-green)', letterSpacing: '0.5px' }}>
              DIGNIFIED SENIOR CARE
            </span>
          </div>
        </div>

        {/* Action Buttons: Patient and Caretaker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setModalRole('ELDER')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '2px solid var(--c-teal-green)',
              backgroundColor: '#FFFFFF',
              color: 'var(--c-deep-ocean)',
              fontWeight: 800,
              fontSize: '0.95rem'
            }}
          >
            Patient
          </button>

          <button
            onClick={() => setModalRole('CARETAKER')}
            style={{
              padding: '10px 22px',
              borderRadius: '8px',
              backgroundColor: 'var(--c-deep-ocean)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 10px rgba(24, 78, 119, 0.2)'
            }}
          >
            <span>Caretaker / Family</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section with High-Contrast Typography & Animations */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '64px 20px 48px 20px',
        textAlign: 'center'
      }} className="animate-hero">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: '24px',
          backgroundColor: 'var(--c-lime)',
          color: 'var(--c-deep-ocean)',
          fontSize: '0.9rem',
          fontWeight: 800,
          marginBottom: '24px',
          border: '1px solid var(--c-mint)'
        }}>
          <ShieldCheck size={18} color="var(--c-deep-ocean)" />
          <span>Patient-Centered Elderly Care & Medication Management</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
          fontWeight: 800,
          color: 'var(--c-deep-ocean)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          maxWidth: '880px',
          margin: '0 auto 20px auto'
        }}>
          Dignified healthcare for seniors. Peace of mind for families.
        </h1>

        <p style={{
          fontSize: '1.2rem',
          fontWeight: 500,
          color: 'var(--text-muted)',
          maxWidth: '740px',
          margin: '0 auto 36px auto',
          lineHeight: 1.6
        }}>
          SehatSathi empowers seniors with an accessible, high-contrast mobile interface, voice audio assistant, 
          and an intelligent escalation chain that keeps family notified when doses are missed.
        </p>

        {/* Hero CTA buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setModalRole('ELDER')}
            style={{
              padding: '16px 36px',
              borderRadius: '10px',
              backgroundColor: 'var(--c-teal-green)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.1rem',
              boxShadow: '0 6px 16px rgba(82, 182, 154, 0.35)'
            }}
          >
            I am a Senior Patient
          </button>

          <button
            onClick={() => setModalRole('CARETAKER')}
            style={{
              padding: '16px 36px',
              borderRadius: '10px',
              backgroundColor: 'var(--c-deep-ocean)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.1rem',
              boxShadow: '0 6px 16px rgba(24, 78, 119, 0.25)'
            }}
          >
            I am a Caretaker or Family Member
          </button>
        </div>
      </section>

      {/* Feature Cards Grid with Less Content + "Read More" button */}
      <section
        ref={sectionRef}
        style={{
          maxWidth: '1100px',
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
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
                  backgroundColor: 'var(--c-lime)',
                  color: 'var(--c-deep-ocean)',
                  display: 'inline-block',
                  marginBottom: '12px'
                }}>
                  {feat.badge}
                </span>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '8px' }}>
                  {feat.title}
                </h3>

                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
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
                  color: 'var(--c-ocean-teal)',
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

      {/* Escalation Workflow Banner */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 20px 60px 20px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '2px solid var(--c-mint)',
          borderRadius: '16px',
          padding: '36px 32px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '8px' }}>
            Multi-Tier Safety Escalation
          </h2>
          <p style={{ fontSize: '0.98rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto 30px auto' }}>
            A verified, deterministic timeline ensuring no missed dose goes unnoticed.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ padding: '16px 22px', borderRadius: '10px', backgroundColor: 'var(--c-lime)', border: '1px solid var(--c-mint)', minWidth: '210px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--c-deep-ocean)' }}>STEP 1</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginTop: '4px' }}>Dose Due</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--c-deep-ocean)' }}>Elder receives reminder</div>
            </div>

            <ArrowRight size={20} color="var(--c-teal-green)" />

            <div style={{ padding: '16px 22px', borderRadius: '10px', backgroundColor: '#FEF3C7', border: '1px solid #D97706', minWidth: '210px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#B45309' }}>STEP 2 (+15 Min)</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400E', marginTop: '4px' }}>Grace Expired</div>
              <div style={{ fontSize: '0.82rem', color: '#92400E' }}>Primary Caretaker alerted</div>
            </div>

            <ArrowRight size={20} color="var(--c-teal-green)" />

            <div style={{ padding: '16px 22px', borderRadius: '10px', backgroundColor: '#FEE2E2', border: '1px solid #DC2626', minWidth: '210px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#991B1B' }}>STEP 3 (+30 Min)</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#991B1B', marginTop: '4px' }}>Escalation</div>
              <div style={{ fontSize: '0.82rem', color: '#991B1B' }}>Family circle notified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        padding: '24px 20px',
        textAlign: 'center',
        fontSize: '0.88rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
          <span>SehatSathi &bull; Prompt Wars X Catalyst Hackathon 2026</span>
          <button
            onClick={() => setModalRole('ADMIN')}
            style={{
              color: 'var(--c-ocean-teal)',
              fontWeight: 800,
              fontSize: '0.85rem',
              textDecoration: 'underline'
            }}
          >
            Admin Portal Access
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: 0 }}>
          Protected by Bcrypt/Argon2 hashing, email OTP verification, and rate-limiting.
        </p>
      </footer>

      {/* Detail Modal for Feature "Read More" */}
      {activeFeatureModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(24, 78, 119, 0.5)',
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
            border: '2px solid var(--c-mint)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--c-lime)',
                  color: 'var(--c-deep-ocean)',
                  display: 'inline-block',
                  marginBottom: '6px'
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
                  <CheckCircle2 size={18} color="var(--c-teal-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
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
                backgroundColor: 'var(--c-deep-ocean)',
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
