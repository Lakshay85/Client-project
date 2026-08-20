import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from '../types';
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
      {/* Blueprint Hero Banner */}
      <header className="dashboard-hero">
        <div>
          <h1>
            Interactive Form Engine
          </h1>
          <p>
            Build high-converting multi-step forms with access controls, instant submissions, and real-time response telemetry.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="fe-btn fe-btn-primary"
            onClick={() => navigate('/builder')}
          >
            <Icon name="plus" size={15} />
            <span>Build New Form</span>
          </button>
          <button
            type="button"
            className="fe-btn fe-btn-ghost"
            onClick={() => navigate('/my-forms')}
          >
            <Icon name="grid" size={15} />
            <span>Explore Templates</span>
          </button>
        </div>
      </header>

      {/* Summary KPI Metric Cards (Blueprint Style) */}
      <div className="metrics-banner">
        <div className="card metric-box">
          <div className="metric-label">Total Forms</div>
          <div className="metric-num">{forms.length}</div>
          <div style={{ fontSize: '11.5px', fontFamily: "'IBM Plex Mono', monospace", color: 'var(--accent-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block' }} />
            Active in Workspace
          </div>
        </div>

        <div className="card metric-box">
          <div className="metric-label">Total Submissions</div>
          <div className="metric-num">{totalSubmissions}</div>
          <div style={{ fontSize: '11.5px', fontFamily: "'IBM Plex Mono', monospace", color: 'var(--success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            Submissions Collected
          </div>
        </div>

        <div className="card metric-box">
          <div className="metric-label">Protected Forms</div>
          <div className="metric-num">{restrictedForms}</div>
          <div style={{ fontSize: '11.5px', fontFamily: "'IBM Plex Mono', monospace", color: 'var(--warning)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--warning)', display: 'inline-block' }} />
            Email Access Control
          </div>
        </div>
      </div>

      {/* Active Forms Section */}
      <section className="forms-grid-section">
        <div className="section-title">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent-primary)' }}>◆</span>
            <span>Your Active Forms</span>
          </h2>
          <span className="count-badge">
            {forms.length} {forms.length === 1 ? 'form' : 'forms'}
          </span>
        </div>

        {fetchingForms ? (
          <div className="card loading-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div className="spinner" />
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', marginTop: '12px' }}>Syncing workspace forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="card empty-forms-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div className="empty-icon-box" style={{ margin: '0 auto 16px', width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--accent-border)', background: 'var(--accent-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="textarea" size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>
              No forms created yet
            </h3>
            <p style={{ maxWidth: '400px', margin: '0 auto 20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Create your first interactive form or choose from our pre-built enterprise templates.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                className="fe-btn fe-btn-primary"
                onClick={() => navigate('/builder')}
              >
                <Icon name="plus" size={15} />
                <span>Build New Form</span>
              </button>
              <button
                type="button"
                className="fe-btn fe-btn-ghost"
                onClick={() => navigate('/my-forms')}
              >
                <Icon name="grid" size={15} />
                <span>Pick a Template</span>
              </button>
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
