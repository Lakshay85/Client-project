import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { Icon } from '../Icons';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="settings-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Toolbar */}
      <header className="dashboard-hero" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="form-card-icon-box" style={{ width: '42px', height: '42px' }}>
            <Icon name="settings" size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '4px' }}>
              Portal &amp; Account Settings
            </h1>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
              Manage workspace appearance, theme modes, security preferences, and account profile.
            </p>
          </div>
        </div>
      </header>

      {/* Main Settings Grid */}
      <div style={{ display: 'grid', gap: '20px', maxWidth: '680px' }}>
        {/* Appearance & Theme Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: '4px' }}>
                Interface Appearance
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', margin: 0, color: 'var(--text-secondary)' }}>
                Toggle between Light Blueprint and Dark Navy theme modes.
              </p>
            </div>
            <ThemeToggle variant="segmented" />
          </div>
        </div>

        {/* Account Profile Card */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: '16px' }}>
            Profile Details
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{
              padding: '12px 16px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ fontWeight: 600, fontSize: '11px', fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Full Name
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                {user.name}
              </div>
            </div>

            <div style={{
              padding: '12px 16px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ fontWeight: 600, fontSize: '11px', fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Account Email
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace" }}>
                {user.email}
              </div>
            </div>

            <div style={{
              padding: '12px 16px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ fontWeight: 600, fontSize: '11px', fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Authentication Status
              </div>
              <div style={{
                color: 'var(--success)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: "'IBM Plex Mono', monospace"
              }}>
                <Icon name="check" size={14} /> Connected &amp; Verified
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
