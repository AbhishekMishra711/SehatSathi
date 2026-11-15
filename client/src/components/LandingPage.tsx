import React, { useState } from 'react';
import { User } from '../types';
import { AuthModal } from './AuthModal';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  PhoneCall, 
  Users, 
  CheckCircle2, 
  MessageSquare,
  ArrowRight,
  Lock
} from 'lucide-react';

interface LandingPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [modalRole, setModalRole] = useState<'ELDER' | 'CARETAKER' | 'ADMIN' | null>(null);

  return (
    <div>
      {/* Top Banner Navigation */}
      <nav style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: 'var(--c-deep-ocean)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <HeartHandshake size={22} />
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--c-deep-ocean)', letterSpacing: '-0.02em' }}>
            SehatSathi
          </span>
        </div>

        {/* Action Buttons: Patient and Caretaker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setModalRole('ELDER')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '2px solid var(--c-ocean-teal)',
              backgroundColor: '#FFFFFF',
              color: 'var(--c-deep-ocean)',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Patient</span>
          </button>

          <button
            onClick={() => setModalRole('CARETAKER')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: 'var(--c-deep-ocean)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Caretaker / Family</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '56px 20px 48px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          backgroundColor: 'var(--c-lime)',
          color: 'var(--c-deep-ocean)',
          fontSize: '0.88rem',
          fontWeight: 700,
          marginBottom: '20px'
        }}>
          <ShieldCheck size={16} />
          <span>Dignified Senior Healthcare & Medication Management</span>
        </div>

        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 900,
          color: 'var(--c-deep-ocean)',
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
          maxWidth: '850px',
          margin: '0 auto 20px auto'
        }}>
          Caring for our elders, with them at the center of every decision.
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-muted)',
          maxWidth: '720px',
          margin: '0 auto 36px auto',
          lineHeight: 1.6
        }}>
          A dedicated senior-first platform that connects elderly individuals with their caretakers and families. 
          Features high-contrast one-touch confirmations, an AI voice companion, and an automated multi-tier escalation chain.
        </p>

        {/* Primary Action Row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setModalRole('ELDER')}
            style={{
              padding: '16px 32px',
              borderRadius: '8px',
              backgroundColor: 'var(--c-deep-ocean)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.05rem',
              boxShadow: '0 4px 12px rgba(24, 78, 119, 0.25)'
            }}
          >
            Enter as Senior Patient
          </button>

          <button
            onClick={() => setModalRole('CARETAKER')}
            style={{
              padding: '16px 32px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '2px solid var(--c-deep-ocean)',
              color: 'var(--c-deep-ocean)',
              fontWeight: 800,
              fontSize: '1.05rem'
            }}
          >
            Enter as Caretaker or Family
          </button>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section style={{
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '20px 20px 60px 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {/* Card 1: Senior First Mobile Experience */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--c-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--c-deep-ocean)',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '8px' }}>
              One-Touch Senior PWA
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Designed specifically for aging eyes and thumbs: 48px+ touch targets, simple 4-digit PIN access, 
              large font sizes, and spoken audio dose instructions.
            </p>
          </div>

          {/* Card 2: AI Voice & Health Companion */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--c-mint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '16px'
            }}>
              <MessageSquare size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '8px' }}>
              AI Voice & Chat Companion
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Seniors can speak or type to their personal health companion. Strictly bounded to their actual prescribed medicines, 
              doctor visits, and healthy daily routine.
            </p>
          </div>

          {/* Card 3: Multi-Tier Escalation */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--c-ocean-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '16px'
            }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '8px' }}>
              Multi-Tier Escalation Chain
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              If a dose is missed past the grace window, the primary caregiver is alerted immediately via email. 
              If still unconfirmed, extended family is notified to ensure elder safety.
            </p>
          </div>

          {/* Card 4: Elder Controlled Permissions */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--c-teal-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '16px'
            }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '8px' }}>
              Elder-Controlled Permissions
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Seniors retain dignity and authority. They decide what each family member can view or edit, 
              and can revoke access at any time with a single tap.
            </p>
          </div>

          {/* Card 5: Safe Prescription AI */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--c-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '16px'
            }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '8px' }}>
              Safe Gemini Schedule Parser
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Caretakers can paste doctor notes into the parser. Gemini structures the frequency and slots, 
              which must be verified by a human before saving.
            </p>
          </div>

          {/* Card 6: Tamper-Evident Audit Trail */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--c-ocean-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '16px'
            }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '8px' }}>
              Complete Transparency
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Every dose confirmed, medication added, or permission changed is logged with exact actor identity 
              and timestamp in an immutable audit trail.
            </p>
          </div>
        </div>
      </section>

      {/* Escalation Workflow Diagram */}
      <section style={{
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '0 20px 60px 20px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '36px 32px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--c-deep-ocean)', marginBottom: '10px' }}>
            How the Escalation Chain Operates
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto 32px auto' }}>
            A deterministic, time-tested safety net that guarantees no senior's medication goes forgotten unnoticed.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ padding: '16px 20px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', border: '1px solid var(--c-ocean-blue)', minWidth: '200px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--c-deep-ocean)' }}>STAGE 1</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '4px' }}>Senior Dose Due</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Email reminder dispatched</div>
            </div>

            <ArrowRight size={20} color="var(--c-ocean-teal)" />

            <div style={{ padding: '16px 20px', borderRadius: '8px', backgroundColor: '#FEF3C7', border: '1px solid #D97706', minWidth: '200px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B45309' }}>STAGE 2 (+15 Min)</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '4px' }}>Grace Period Passed</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Primary Caretaker alerted</div>
            </div>

            <ArrowRight size={20} color="var(--c-ocean-teal)" />

            <div style={{ padding: '16px 20px', borderRadius: '8px', backgroundColor: '#FEE2E2', border: '1px solid #DC2626', minWidth: '200px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991B1B' }}>STAGE 3 (+30 Min)</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '4px' }}>Extended Escalation</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Family Circle notified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Admin portal link */}
      <footer style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        padding: '24px 20px',
        textAlign: 'center',
        fontSize: '0.88rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
          <span>SehatSathi Platform &bull; Prompt Wars X Catalyst 2026</span>
          <button
            onClick={() => setModalRole('ADMIN')}
            style={{
              color: 'var(--c-ocean-blue)',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'underline'
            }}
          >
            Admin Portal Access
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: 0 }}>
          Protected by Argon2/Bcrypt hashing, verified email OTPs, and rate limiting.
        </p>
      </footer>

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
