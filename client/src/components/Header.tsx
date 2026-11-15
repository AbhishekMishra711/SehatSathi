import React from 'react';
import { User } from '../types';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header style={{
      backgroundColor: 'var(--c-deep-ocean)',
      borderBottom: '4px solid var(--c-mint)',
      padding: '18px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 6px 20px rgba(24, 78, 119, 0.22)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src="/logo.png"
          alt="SehatSathi Care Logo"
          className="animate-logo-entrance logo-pulse"
          style={{ width: '48px', height: '48px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))' }}
        />
        <div className="animate-title-slide">
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
            SehatSathi
          </span>
          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--c-lime)', letterSpacing: '0.8px' }}>
            DIGNIFIED SENIOR CARE
          </span>
        </div>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>
              {user.name}
            </div>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '12px',
              backgroundColor: user.role === 'ELDER' ? 'var(--c-lime)' : 'var(--c-mint)',
              color: 'var(--c-deep-ocean)'
            }}>
              {user.role === 'ELDER' ? 'Patient' : user.role === 'ADMIN' ? 'Administrator' : user.role === 'CARETAKER' ? 'Primary Caretaker' : 'Family Member'}
            </span>
          </div>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 700
            }}
            aria-label="Sign out of account"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
};
