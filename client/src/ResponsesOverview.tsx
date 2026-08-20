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
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);

  const totalForms = forms.length;
  const totalResponses = forms.reduce((sum, f) => sum + (f.responseCount || 0), 0);
  const totalApproved = forms.reduce((sum, f) => sum + (f.approvedCount || 0), 0);
  const totalRejected = forms.reduce((sum, f) => sum + (f.rejectedCount || 0), 0);
  const totalPending = forms.reduce((sum, f) => sum + (f.pendingCount || 0), 0);

  const pendingFormsCount = forms.filter((f) => (f.pendingCount || 0) > 0).length;
  const approvedFormsCount = forms.filter((f) => (f.approvedCount || 0) > 0).length;
  const rejectedFormsCount = forms.filter((f) => (f.rejectedCount || 0) > 0).length;

  const filteredForms = forms.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesApproval = true;
    if (approvalFilter === 'pending') {
      matchesApproval = (f.pendingCount || 0) > 0;
    } else if (approvalFilter === 'approved') {
      matchesApproval = (f.approvedCount || 0) > 0;
    } else if (approvalFilter === 'rejected') {
      matchesApproval = (f.rejectedCount || 0) > 0;
    }

    return matchesSearch && matchesApproval;
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
              Inspect submission records, approve or reject responses, export CSV reports, and manage respondents.
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

      {/* Metrics Row: Total Submissions, Pending, Approved, Rejected */}
      <div className="responses-metrics-grid approval-metrics-grid">
        <div className="card metric-card">
          <div className="metric-card-header">
            <span className="metric-title">Total Submissions</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
              <Icon name="users" size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{totalResponses}</span>
            <span className="metric-badge neutral">{totalForms} Form{totalForms === 1 ? '' : 's'}</span>
          </div>
          <p className="metric-footer-text">Responses collected across all forms</p>
        </div>

        <div className="card metric-card">
          <div className="metric-card-header">
            <span className="metric-title">Pending Review</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.14)', color: '#f59e0b' }}>
              <Icon name="clock" size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: totalPending > 0 ? '#f59e0b' : 'inherit' }}>
              {totalPending}
            </span>
            <span className={`metric-badge ${totalPending > 0 ? 'warning' : 'neutral'}`}>
              {totalPending > 0 ? 'Awaiting Action' : 'All Clear'}
            </span>
          </div>
          <p className="metric-footer-text">
            {pendingFormsCount} form{pendingFormsCount === 1 ? '' : 's'} with pending responses
          </p>
        </div>

        <div className="card metric-card">
          <div className="metric-card-header">
            <span className="metric-title">Approved Responses</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Icon name="check-circle" size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: '#10b981' }}>{totalApproved}</span>
            <span className="metric-badge success">Approved</span>
          </div>
          <p className="metric-footer-text">Accepted respondent submissions</p>
        </div>

        <div className="card metric-card">
          <div className="metric-card-header">
            <span className="metric-title">Rejected Responses</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
              <Icon name="x-circle" size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: totalRejected > 0 ? '#ef4444' : 'inherit' }}>
              {totalRejected}
            </span>
            <span className={`metric-badge ${totalRejected > 0 ? 'danger' : 'neutral'}`}>
              Rejected
            </span>
          </div>
          <p className="metric-footer-text">Declined respondent submissions</p>
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
            className={`filter-pill ${approvalFilter === 'all' ? 'active' : ''}`}
            onClick={() => setApprovalFilter('all')}
          >
            All Forms ({forms.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${approvalFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setApprovalFilter('pending')}
          >
            Needs Review ({pendingFormsCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${approvalFilter === 'approved' ? 'active' : ''}`}
            onClick={() => setApprovalFilter('approved')}
          >
            Has Approved ({approvedFormsCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${approvalFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => setApprovalFilter('rejected')}
          >
            Has Rejected ({rejectedFormsCount})
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
              {searchTerm || approvalFilter !== 'all' ? 'No forms matching filter' : 'No forms available'}
            </h3>
            <p style={{ maxWidth: '420px', margin: '0 auto 20px', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {searchTerm || approvalFilter !== 'all'
                ? `No forms found matching your current filter criteria. Try resetting filters or search term.`
                : 'Create your first form to start collecting responses and analyzing submissions.'}
            </p>
            {!searchTerm && approvalFilter === 'all' ? (
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
                  setApprovalFilter('all');
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
              const appCount = form.approvedCount || 0;
              const rejCount = form.rejectedCount || 0;
              const pendCount = form.pendingCount || 0;
              const fieldsCount = form.fieldCount || form.fields?.length || 0;

              return (
                <article key={form.id} className="card form-response-card">
                  <div className="response-card-main">
                    <div className="response-card-header">
                      <div className="form-card-icon-avatar">
                        <Icon name="textarea" size={18} />
                      </div>
                      <div className="response-card-quick-status">
                        {pendCount > 0 && (
                          <span className="status-pill-badge pending" title={`${pendCount} pending review`}>
                            <span className="pulse-dot" />
                            {pendCount} Pending
                          </span>
                        )}
                        {pendCount === 0 && respCount > 0 && (
                          <span className="status-pill-badge reviewed" title="All submissions reviewed">
                            Reviewed
                          </span>
                        )}
                        {respCount === 0 && (
                          <span className="status-pill-badge no-resp">
                            0 Submissions
                          </span>
                        )}
                      </div>
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
                        <strong>{respCount}</strong> {respCount === 1 ? 'Total' : 'Total'}
                      </span>
                      {appCount > 0 && (
                        <span className="meta-chip success-chip" title={`${appCount} Approved`}>
                          <Icon name="check-circle" size={13} />
                          <strong>{appCount}</strong> Approved
                        </span>
                      )}
                      {rejCount > 0 && (
                        <span className="meta-chip danger-chip" title={`${rejCount} Rejected`}>
                          <Icon name="x-circle" size={13} />
                          <strong>{rejCount}</strong> Rejected
                        </span>
                      )}
                      <span className="meta-chip">
                        <Icon name="checkbox" size={13} />
                        {fieldsCount} Fields
                      </span>
                    </div>
                  </div>

                  <div className="response-card-footer">
                    <button
                      type="button"
                      className="btn btn-3d-primary btn-full"
                      onClick={() => onSelectFormResponses(form.id)}
                    >
                      <span>Review &amp; Manage Approvals</span>
                      <Icon name="arrow-right" size={14} />
                    </button>

                    {form.shareId && (
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
