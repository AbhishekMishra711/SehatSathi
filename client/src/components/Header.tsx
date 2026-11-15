import React from 'react';
import { User } from '../types';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="glass-nav" style={{
      padding: '16px 44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src="/logo.png"
          alt="SehatSathi Care Logo"
          className="animate-logo-entrance logo-pulse"
          style={{ width: '48px', height: '48px', objectFit: 'contain' }}
        />
        <div className="animate-title-slide">
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', display: 'block', lineHeight: 1.1 }}>
            SehatSathi
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#00A86B', letterSpacing: '0.8px' }}>
            DIGNIFIED SENIOR CARE
          </span>
        </div>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>
              {user.name}
            </div>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '3px 12px',
              borderRadius: '9999px',
              backgroundColor: user.role === 'ELDER' ? '#E8F8EE' : '#E0F2FE',
              color: user.role === 'ELDER' ? '#00875A' : '#0369A1',
              border: user.role === 'ELDER' ? '1px solid #A7F3D0' : '1px solid #BAE6FD'
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
              padding: '9px 18px',
              borderRadius: '9999px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '0.88rem',
              fontWeight: 700,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
            aria-label="Sign out of account"
          >
            <LogOut size={15} color="#64748B" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
};
