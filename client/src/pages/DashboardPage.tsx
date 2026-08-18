import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from '../types';
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

  const totalSubmissions = forms.reduce((acc, f) => acc + (f.responseCount || 0), 0);
  const restrictedForms = forms.filter((f) => f.accessType && f.accessType !== 'allow_all').length;

  return (
    <div className="dashboard-content">
      {/* Hero Banner */}
      <header className="dashboard-hero">
        <div>
          <div className="hero-glass-badge">
            <span className="live-dot" />
            <span>Workspace Overview</span>
          </div>
          <h1>
            Interactive Form Engine
          </h1>
          <p>
            Build high-converting multi-step forms with access controls, instant submissions, and real-time response analytics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button3D
            variant="primary"
            size="md"
            icon={<Icon name="plus" size={16} />}
            onClick={() => navigate('/builder')}
          >
            Build New Form
          </Button3D>
          <Button3D
            variant="secondary"
            size="md"
            icon={<Icon name="grid" size={16} />}
            onClick={() => navigate('/my-forms')}
          >
            Explore Templates
          </Button3D>
        </div>
      </header>

      {/* Summary KPI Metric Cards */}
      <div className="metrics-banner">
        <div className="card metric-box">
          <div className="metric-label">Total Forms</div>
          <div className="metric-num">{forms.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <Icon name="zap" size={13} /> Active in Workspace
          </div>
        </div>

        <div className="card metric-box">
          <div className="metric-label">Total Submissions</div>
          <div className="metric-num">{totalSubmissions}</div>
          <div style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <Icon name="trending-up" size={13} /> Submissions Collected
          </div>
        </div>

        <div className="card metric-box">
          <div className="metric-label">Protected Forms</div>
          <div className="metric-num">{restrictedForms}</div>
          <div style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <Icon name="lock" size={13} /> Email Access Control
          </div>
        </div>
      </div>

      {/* Active Forms Section */}
      <section className="forms-grid-section">
        <div className="section-title">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="sparkles" size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>Your Active Forms</span>
          </h2>
          <span className="count-badge">
            {forms.length} {forms.length === 1 ? 'form' : 'forms'}
          </span>
        </div>

        {fetchingForms ? (
          <div className="card loading-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div className="spinner" />
            <p>Syncing workspace forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="card empty-forms-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div className="empty-icon-box" style={{ margin: '0 auto 16px' }}>
              <Icon name="textarea" size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>
              No forms created yet
            </h3>
            <p style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
              Create your first interactive form or choose from our pre-built enterprise templates.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Button3D
                variant="primary"
                size="md"
                icon={<Icon name="plus" size={16} />}
                onClick={() => navigate('/builder')}
              >
                Build New Form
              </Button3D>
              <Button3D
                variant="secondary"
                size="md"
                icon={<Icon name="grid" size={16} />}
                onClick={() => navigate('/my-forms')}
              >
                Pick a Template
              </Button3D>
            </div>
          </div>
        ) : (
          <div className="forms-grid">
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
