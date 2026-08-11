import React from 'react';
import { useAuth } from '../context/AuthContext';
import { TiltCard } from '../components/TiltCard';
import { Icon } from '../Icons';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="settings-page">
      {/* Header Toolbar */}
      <header
        className="settings-header"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)',
          borderRadius: '24px',
          padding: '28px 32px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#ffffff',
          marginBottom: '28px',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#06b6d4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon name="settings" size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px', color: '#ffffff', letterSpacing: '-0.01em' }}>
            Portal & Account Settings
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
            Manage workspace permissions, API tokens, and user profile preferences.
          </p>
        </div>
      </header>

      {/* Main Settings Body */}
      <TiltCard maxRotateX={4} maxRotateY={4}>
        <div
          style={{
            padding: '32px',
            background: 'linear-gradient(145deg, #0e172a 0%, #070c18 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'grid', gap: '16px', maxWidth: '500px' }}>
            <div
              style={{
                padding: '16px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#ffffff' }}>
                Account Email
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '14px' }}>{user.email}</div>
            </div>
            <div
              style={{
                padding: '16px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#ffffff' }}>
                Full Name
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '14px' }}>{user.name}</div>
            </div>
            <div
              style={{
                padding: '16px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#ffffff' }}>
                Google OAuth Status
              </div>
              <div
                style={{
                  color: '#10b981',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Icon name="check" size={14} /> Authenticated & Connected
              </div>
            </div>
          </div>
        </div>
      </TiltCard>
    </div>
  );
};
