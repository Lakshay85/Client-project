import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from '../types';
import { TiltCard } from '../components/TiltCard';
import { Button3D } from '../components/Button3D';
import { ActiveFormCard } from '../components/ActiveFormCard';
import { Icon } from '../Icons';

interface DashboardPageProps {
  forms: Form[];
  fetchingForms: boolean;
  onCopyLink: (shareId: string) => void;
  onEditForm: (form: Form) => void;
  onDeleteForm: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  forms,
  fetchingForms,
  onCopyLink,
  onEditForm,
  onDeleteForm,
}) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-content">
      {/* Hero Banner */}
      <header
        className="dashboard-hero"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)',
          borderRadius: '24px',
          padding: '28px 32px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#ffffff',
          marginBottom: '28px',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              margin: '0 0 12px',
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}
          >
            Interactive Form Engine
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#94a3b8',
              margin: '0 0 24px',
              maxWidth: '650px',
              lineHeight: 1.5
            }}
          >
            Build high-converting multi-step forms with email access control, real-time analytics, and 3D preview.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          <Button3D
            variant="primary"
            size="md"
            icon={<Icon name="plus" size={18} />}
            onClick={() => navigate('/builder')}
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)'
            }}
          >
            Build New Form
          </Button3D>
          <Button3D
            variant="secondary"
            size="md"
            icon={<Icon name="grid" size={18} />}
            onClick={() => navigate('/my-forms')}
          >
            Explore Templates
          </Button3D>
        </div>
      </header>

      {/* Summary Metric Cards */}
      <div
        className="metrics-summary-bar"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}
      >
        <TiltCard glowColor="rgba(79, 70, 229, 0.15)" maxRotateX={6} maxRotateY={6}>
          <div
            style={{
              padding: '24px',
              background: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-lg)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
                TOTAL FORMS
              </div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#06b6d4',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(6, 182, 212, 0.2)'
                }}
              >
                <Icon name="textarea" size={18} />
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
              {forms.length}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#10b981',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Icon name="zap" size={14} /> <span>Active in Workspace</span>
            </div>
          </div>
        </TiltCard>

        <TiltCard glowColor="rgba(139, 92, 246, 0.15)" maxRotateX={6} maxRotateY={6}>
          <div
            style={{
              padding: '24px',
              background: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-lg)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
                TOTAL SUBMISSIONS
              </div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#c084fc',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(139, 92, 246, 0.2)'
                }}
              >
                <Icon name="users" size={18} />
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
              {forms.reduce((acc, f) => acc + (f.responseCount || 0), 0)}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#8b5cf6',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Icon name="trending-up" size={14} /> <span>Submissions Collected</span>
            </div>
          </div>
        </TiltCard>

        <TiltCard glowColor="rgba(245, 158, 11, 0.15)" maxRotateX={6} maxRotateY={6}>
          <div
            style={{
              padding: '24px',
              background: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-lg)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
                RESTRICTED FORMS
              </div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(245, 158, 11, 0.2)'
                }}
              >
                <Icon name="lock" size={18} />
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
              {forms.filter((f) => f.accessType && f.accessType !== 'allow_all').length}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#f59e0b',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Icon name="lock" size={14} /> <span>Email Access Protection</span>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Active Forms Section */}
      <section className="forms-grid-section">
        <div
          className="section-title"
          style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}
        >
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="sparkles" size={20} style={{ color: '#06b6d4' }} />
            <span>Your Active Forms</span>
          </h2>
          <span
            className="count-badge"
            style={{
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: '#e2e8f0',
              color: '#1e293b',
              fontWeight: 700
            }}
          >
            {forms.length} Forms
          </span>
        </div>

        {fetchingForms ? (
          <div className="card loading-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p>Syncing workspace forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <TiltCard maxRotateX={6} maxRotateY={8}>
            <div
              className="empty-forms-card"
              style={{
                padding: '40px',
                textAlign: 'center',
                background: '#0f172a',
                borderRadius: '24px',
                border: '1.5px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <div
                className="empty-icon-box"
                style={{
                  margin: '0 auto 16px',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#06b6d4'
                }}
              >
                <Icon name="textarea" size={32} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: '#ffffff' }}>
                No forms created yet
              </h3>
              <p style={{ color: '#94a3b8', margin: 0 }}>
                Click "Build New Form" or pick a template to start in seconds.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                <Button3D
                  variant="primary"
                  size="md"
                  icon={<Icon name="plus" size={18} />}
                  onClick={() => navigate('/builder')}
                >
                  Build New Form
                </Button3D>
                <Button3D
                  variant="secondary"
                  size="md"
                  icon={<Icon name="grid" size={18} />}
                  onClick={() => navigate('/my-forms')}
                >
                  Explore Templates
                </Button3D>
              </div>
            </div>
          </TiltCard>
        ) : (
          <div
            className="forms-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}
          >
            {forms.map((form) => (
              <ActiveFormCard
                key={form.id}
                form={form}
                onCopyLink={onCopyLink}
                onEdit={onEditForm}
                onDelete={onDeleteForm}
                onViewResponses={(formId) => navigate(`/analytics/${formId}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
