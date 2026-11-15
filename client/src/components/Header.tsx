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
      backgroundColor: '#009F6B',
      borderBottom: '4px solid #9BE5AA',
      padding: '20px 44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 8px 24px rgba(0, 159, 107, 0.25)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img
          src="/logo.png"
          alt="SehatSathi Care Logo"
          className="animate-logo-entrance logo-pulse"
          style={{ width: '54px', height: '54px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }}
        />
        <div className="animate-title-slide">
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
            SehatSathi
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9BE5AA', letterSpacing: '1px' }}>
            DIGNIFIED SENIOR CARE
          </span>
        </div>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
              {user.name}
            </div>
            <span style={{
              fontSize: '0.76rem',
              fontWeight: 800,
              padding: '3px 12px',
              borderRadius: '12px',
              backgroundColor: user.role === 'ELDER' ? '#9BE5AA' : '#DCFCE7',
              color: '#004D34'
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
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              color: '#FFFFFF',
              fontSize: '0.92rem',
              fontWeight: 800
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
