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
      backgroundColor: '#FFFFFF',
      borderBottom: '2px solid var(--c-mint)',
      padding: '12px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(24, 78, 119, 0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src="/logo.svg"
          alt="SehatSathi Care Logo"
          style={{ width: '38px', height: '38px', objectFit: 'contain' }}
        />
        <div>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--c-deep-ocean)', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
            SehatSathi
          </span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--c-teal-green)' }}>
            DIGNIFIED SENIOR CARE
          </span>
        </div>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {user.name}
            </div>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: user.role === 'ELDER' ? 'var(--c-lime)' : user.role === 'ADMIN' ? 'var(--c-deep-ocean)' : 'var(--c-mint)',
              color: user.role === 'ADMIN' ? '#FFFFFF' : 'var(--c-deep-ocean)'
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
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-strong)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
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
