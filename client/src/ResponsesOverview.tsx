import { useState } from 'react';
import { Form } from './types';
import { Icon } from './Icons';
import { TiltCard } from './components/TiltCard';
import { Button3D } from './components/Button3D';

interface ResponsesOverviewProps {
  forms: Form[];
  fetching: boolean;
  onSelectFormResponses: (formId: string) => void;
  onBackToDashboard: () => void;
  onCreateNewForm: () => void;
}

export function ResponsesOverview({
  forms,
  fetching,
  onSelectFormResponses,
  onBackToDashboard,
  onCreateNewForm
}: ResponsesOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const totalResponses = forms.reduce((sum, f) => sum + (f.responseCount || 0), 0);
  const activeFormsCount = forms.filter((f) => f.status === 'published').length;

  const filteredForms = forms.filter(
    (f) =>
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="responses-overview-page">
      {/* Header Toolbar */}
      <header className="responses-hub-header" style={{ marginBottom: '24px' }}>
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button3D variant="ghost" size="sm" icon={<Icon name="arrow-left" size={15} />} onClick={onBackToDashboard}>
            Dashboard
          </Button3D>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px', color: '#000000' }}>Responses & Submissions Hub 3D</h1>
            <p style={{ color: '#1e293b', margin: 0 }}>Select any form to inspect detailed response records, export CSV reports, and track analytics.</p>
          </div>
        </div>
      </header>

      {/* 3D Metrics Row */}
      <div className="responses-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <TiltCard glowColor="rgba(13, 148, 136, 0.3)">
          <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #0d9488, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 15px rgba(13, 148, 136, 0.3)' }}>
              <Icon name="textarea" size={26} />
            </div>
            <div>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--slate-900)', display: 'block' }}>{forms.length}</span>
              <span style={{ fontSize: '13px', color: 'var(--slate-500)', fontWeight: 600 }}>Total Built Forms</span>
            </div>
          </div>
        </TiltCard>

        <TiltCard glowColor="rgba(139, 92, 246, 0.3)">
          <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)' }}>
              <Icon name="users" size={26} />
            </div>
            <div>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--slate-900)', display: 'block' }}>{totalResponses}</span>
              <span style={{ fontSize: '13px', color: 'var(--slate-500)', fontWeight: 600 }}>Total Submissions</span>
            </div>
          </div>
        </TiltCard>

        <TiltCard glowColor="rgba(16, 185, 129, 0.3)">
          <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}>
              <Icon name="check" size={26} />
            </div>
            <div>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--slate-900)', display: 'block' }}>{activeFormsCount}</span>
              <span style={{ fontSize: '13px', color: 'var(--slate-500)', fontWeight: 600 }}>Active Forms</span>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Search Bar */}
      <div className="responses-hub-controls card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)', background: 'var(--glass-bg-card)', backdropFilter: 'var(--glass-blur-md)', border: '1px solid var(--glass-border-light)', marginBottom: '24px' }}>
        <div className="search-box" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--slate-100)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)' }}>
          <Icon name="search" size={18} />
          <input
            type="text"
            placeholder="Search forms by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: 'var(--slate-800)', fontWeight: 500 }}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* 3D Built Forms Section */}
      <section className="built-forms-responses-section">
        {fetching ? (
          <div className="card loading-card">
            <div className="spinner"></div>
            <p>Loading responses data...</p>
          </div>
        ) : filteredForms.length === 0 ? (
          <TiltCard maxRotateX={6} maxRotateY={6}>
            <div className="empty-forms-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Icon name="users" size={32} />
              </div>
              <h3>{searchTerm ? 'No forms matching search' : 'No forms created yet'}</h3>
              <p style={{ color: 'var(--slate-500)', margin: '0 0 20px' }}>
                {searchTerm
                  ? 'Try searching with a different title.'
                  : 'Build your first form to start collecting submissions.'}
              </p>
              {!searchTerm && (
                <Button3D variant="primary" size="md" icon={<Icon name="plus" size={18} />} onClick={onCreateNewForm}>
                  Build New Form
                </Button3D>
              )}
            </div>
          </TiltCard>
        ) : (
          <div className="built-forms-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredForms.map((form) => {
              const respCount = form.responseCount || 0;
              return (
                <TiltCard key={form.id} maxRotateX={8} maxRotateY={10} glowColor="rgba(6, 182, 212, 0.2)">
                  <article className="built-form-response-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: '280px', background: 'linear-gradient(145deg, #0e172a 0%, #070c18 100%)', borderRadius: '24px', border: '1.5px solid rgba(255, 255, 255, 0.18)', boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)', boxSizing: 'border-box' }}>
                    <div>
                      <div className="built-form-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div className="form-card-icon" style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                          <Icon name="textarea" size={22} />
                        </div>
                        <span className={`status-pill ${form.status}`} style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(6, 78, 59, 0.75)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {form.status.toUpperCase()}
                        </span>
                      </div>

                      <h3
                        className="built-form-title"
                        style={{
                          fontSize: '18px',
                          fontWeight: 800,
                          margin: '0 0 8px',
                          color: '#ffffff',
                          letterSpacing: '-0.01em',
                          height: '50px',
                          minHeight: '50px',
                          maxHeight: '50px',
                          lineHeight: '1.38',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {form.title}
                      </h3>
                      <p
                        className="built-form-desc"
                        style={{
                          fontSize: '13px',
                          color: '#94a3b8',
                          margin: '0 0 16px',
                          lineHeight: '1.45',
                          height: '38px',
                          minHeight: '38px',
                          maxHeight: '38px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {form.description || 'Please fill out this form to submit your details.'}
                      </p>
                    </div>

                    <div>
                      <div className="built-form-stats" style={{ padding: '12px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '20px', display: 'flex', gap: '20px' }}>
                        <span className="stat-badge responses-highlight" style={{ fontSize: '13px', fontWeight: 700, color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon name="users" size={15} /> <strong>{respCount}</strong> Submissions
                        </span>
                        <span className="stat-badge" style={{ fontSize: '13px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon name="checkbox" size={15} /> {form.fieldCount || form.fields?.length || 0} Fields
                        </span>
                      </div>

                      <Button3D
                        variant="primary"
                        size="md"
                        style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', boxShadow: '0 4px 18px rgba(6, 182, 212, 0.4)' }}
                        icon={<Icon name="arrow-right" size={15} />}
                        onClick={() => onSelectFormResponses(form.id)}
                      >
                        View Submissions & CSV
                      </Button3D>
                    </div>
                  </article>
                </TiltCard>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
