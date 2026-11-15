import React from 'react';
import { User } from '../types';
import { HeartPulse, LogOut } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <HeartPulse size={26} color="var(--primary-teal)" />
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-teal)', letterSpacing: '-0.02em' }}>
          SehatSathi
        </span>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user.name}
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: user.role === 'ELDER' ? 'var(--primary-teal-light)' : 'var(--bg-subtle)',
              color: user.role === 'ELDER' ? 'var(--primary-teal)' : 'var(--text-muted)'
            }}>
              {user.role === 'ELDER' ? 'Senior Profile' : user.role === 'CARETAKER' ? 'Primary Caretaker' : 'Family Member'}
            </span>
          </div>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: 500
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
