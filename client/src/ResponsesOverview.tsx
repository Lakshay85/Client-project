import { useState } from 'react';
import { Form } from './types';
import { Icon } from './Icons';
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
  onCreateNewForm
}: ResponsesOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);

  const totalResponses = forms.reduce((sum, f) => sum + (f.responseCount || 0), 0);
  const activeFormsCount = forms.filter((f) => f.status === 'published').length;
  const draftFormsCount = forms.filter((f) => f.status === 'draft').length;

  const filteredForms = forms.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' ? true : f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyLink = (shareId: string, formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/form/${shareId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedFormId(formId);
      setTimeout(() => setCopiedFormId(null), 2000);
    });
  };

  return (
    <div className="responses-overview-page">
      {/* Hero Header */}
      <header className="responses-hero-card card">
        <div className="hero-content-left">
          <div className="hero-icon-badge">
            <Icon name="chart" size={24} />
          </div>
          <div>
            <h1 className="hero-title">Responses & Analytics Hub</h1>
            <p className="hero-subtitle">
              Inspect submission records, export CSV reports, and monitor respondent engagement in real-time.
            </p>
          </div>
        </div>

        <div className="hero-actions">
          <Button3D
            variant="primary"
            size="md"
            icon={<Icon name="plus" size={15} />}
            onClick={onCreateNewForm}
          >
            Create New Form
          </Button3D>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="responses-metrics-grid">
        <div className="card metric-card">
          <div className="metric-card-header">
            <span className="metric-title">Total Forms</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <Icon name="grid" size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{forms.length}</span>
            <span className="metric-badge neutral">Workspace Total</span>
          </div>
          <p className="metric-footer-text">Total forms in your workspace</p>
        </div>

        <div className="card metric-card">
          <div className="metric-card-header">
            <span className="metric-title">Total Submissions</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <Icon name="users" size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{totalResponses}</span>
            <span className="metric-badge accent">Live Records</span>
          </div>
          <p className="metric-footer-text">Responses collected across all forms</p>
        </div>

        <div className="card metric-card">
          <div className="metric-card-header">
            <span className="metric-title">Active / Published</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Icon name="zap" size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{activeFormsCount}</span>
            <span className="metric-badge success">Live</span>
          </div>
          <p className="metric-footer-text">
            {activeFormsCount} published, {draftFormsCount} draft(s)
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="responses-controls-bar card">
        <div className="search-input-wrapper">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Search forms by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              <Icon name="x" size={14} />
            </button>
          )}
        </div>

        <div className="status-filter-pills">
          <button
            type="button"
            className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Forms ({forms.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === 'published' ? 'active' : ''}`}
            onClick={() => setStatusFilter('published')}
          >
            Published ({activeFormsCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === 'draft' ? 'active' : ''}`}
            onClick={() => setStatusFilter('draft')}
          >
            Drafts ({draftFormsCount})
          </button>
        </div>
      </div>

      {/* Forms Grid */}
      <section className="responses-forms-section">
        {fetching ? (
          <div className="card loading-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner" />
            <p style={{ marginTop: '14px', color: 'var(--text-muted)' }}>Loading responses data...</p>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="card empty-forms-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div className="empty-icon-box" style={{ margin: '0 auto 16px', width: '56px', height: '56px', borderRadius: '16px', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <Icon name="chart" size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
              {searchTerm ? 'No forms matching search' : 'No forms available'}
            </h3>
            <p style={{ maxWidth: '420px', margin: '0 auto 20px', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {searchTerm
                ? `No forms found matching "${searchTerm}". Try another keyword or clear filters.`
                : 'Create your first form to start collecting responses and analyzing submissions.'}
            </p>
            {!searchTerm ? (
              <Button3D
                variant="primary"
                size="md"
                icon={<Icon name="plus" size={16} />}
                onClick={onCreateNewForm}
              >
                Create New Form
              </Button3D>
            ) : (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="responses-cards-grid">
            {filteredForms.map((form) => {
              const respCount = form.responseCount || 0;
              const fieldsCount = form.fieldCount || form.fields?.length || 0;
              const isPublished = form.status === 'published';

              return (
                <article key={form.id} className="card form-response-card">
                  <div className="response-card-main">
                    <div className="response-card-header">
                      <div className="form-card-icon-avatar">
                        <Icon name="textarea" size={18} />
                      </div>
                      <span className={`status-pill-badge ${isPublished ? 'published' : 'draft'}`}>
                        <span className="pulse-dot" />
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <h3 className="response-card-title" title={form.title}>
                      {form.title}
                    </h3>

                    <p className="response-card-desc">
                      {form.description || 'Please fill out this form to submit your details.'}
                    </p>

                    <div className="response-card-badges">
                      <span className="meta-chip highlight">
                        <Icon name="users" size={13} />
                        <strong>{respCount}</strong> {respCount === 1 ? 'Submission' : 'Submissions'}
                      </span>
                      <span className="meta-chip">
                        <Icon name="checkbox" size={13} />
                        {fieldsCount} Fields
                      </span>
                      {form.singleSubmissionOnly && (
                        <span className="meta-chip" title="Limit 1 response per user active">
                          <Icon name="lock" size={13} /> 1/User
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="response-card-footer">
                    <button
                      type="button"
                      className="btn btn-3d-primary btn-full"
                      onClick={() => onSelectFormResponses(form.id)}
                    >
                      <span>View Submissions & CSV</span>
                      <Icon name="arrow-right" size={14} />
                    </button>

                    {isPublished && form.shareId && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm copy-link-btn"
                        onClick={(e) => handleCopyLink(form.shareId, form.id, e)}
                        title="Copy public link to clipboard"
                      >
                        <Icon name={copiedFormId === form.id ? 'check' : 'link'} size={13} />
                        <span>{copiedFormId === form.id ? 'Copied Link!' : 'Share Link'}</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
