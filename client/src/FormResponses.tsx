import { useEffect, useState } from 'react';
import { Icon } from './Icons';
import { FormField, FormSubmission, SubmissionStatus } from './types';
import { Button3D } from './components/Button3D';

interface FormResponsesProps {
  formId: string;
  token: string;
  apiUrl: string;
  onBack: () => void;
}

type ViewMode = 'table' | 'cards';

function formatISTDate(dateStr: string | Date, options?: Intl.DateTimeFormatOptions) {
  if (!dateStr) return 'N/A';
  let d: Date;
  if (typeof dateStr === 'string') {
    const trimmed = dateStr.trim();
    if (!trimmed.endsWith('Z') && !trimmed.includes('+') && !/-\d{2}:\d{2}$/.test(trimmed)) {
      d = new Date(trimmed.replace(' ', 'T') + '+05:30');
    } else {
      d = new Date(trimmed);
    }
  } else {
    d = dateStr;
  }
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    ...options
  });
}

export function exportCSVContent(
  formTitle: string,
  fields: FormField[],
  submissions: FormSubmission[]
): string {
  const headers = [
    'Submission ID',
    'Submitted At',
    'Approval Status',
    'Submitter Email',
    'Submitter IP',
    ...fields.map((f) => `"${f.label.replace(/"/g, '""')}"`)
  ].join(',');
  const rows = submissions.map((sub) => {
    const answers = fields.map((f) => {
      const val = sub.answers[f.id] || '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    return [
      sub.id,
      formatISTDate(sub.submittedAt),
      (sub.status || 'pending').toUpperCase(),
      `"${String(sub.submitterEmail || 'N/A').replace(/"/g, '""')}"`,
      sub.submitterIp || 'N/A',
      ...answers
    ].join(',');
  });
  return [headers, ...rows].join('\n');
}

export function FormResponses({ formId, token, apiUrl, onBack }: FormResponsesProps) {
  const [formTitle, setFormTitle] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusActionMessage, setStatusActionMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeModalSubmission, setActiveModalSubmission] = useState<FormSubmission | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | SubmissionStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchResponses();
  }, [formId]);

  const fetchResponses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/forms/${formId}/responses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = (await response.json()) as {
        formTitle?: string;
        fields?: FormField[];
        submissions?: FormSubmission[];
        message?: string;
      };

      if (!response.ok) throw new Error(data.message || 'Failed to load responses.');
      setFormTitle(data.formTitle || 'Form Responses');
      setFields(data.fields || []);
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load responses.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    submissionId: string,
    newStatus: SubmissionStatus,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    if (updatingId) return;

    setUpdatingId(submissionId);
    setError('');

    // Optimistic UI update
    const previousSubmissions = [...submissions];
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: newStatus } : s))
    );
    if (activeModalSubmission && activeModalSubmission.id === submissionId) {
      setActiveModalSubmission({ ...activeModalSubmission, status: newStatus });
    }

    try {
      const response = await fetch(`${apiUrl}/api/forms/${formId}/responses/${submissionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update response status.');
      }

      const statusLabel = newStatus === 'approved' ? 'Approved' : newStatus === 'rejected' ? 'Rejected' : 'marked as Pending';
      setStatusActionMessage(`Response ${statusLabel} successfully`);
      setTimeout(() => setStatusActionMessage(null), 3000);
    } catch (err) {
      // Revert optimistic update on error
      setSubmissions(previousSubmissions);
      if (activeModalSubmission && activeModalSubmission.id === submissionId) {
        const orig = previousSubmissions.find((s) => s.id === submissionId);
        if (orig) setActiveModalSubmission(orig);
      }
      setError(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    if (submissions.length === 0) return;
    const content = exportCSVContent(formTitle, fields, filteredSubmissions);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseAnswerValue = (rawVal?: string): string => {
    if (!rawVal) return 'No response';
    try {
      if (rawVal.startsWith('[') || rawVal.startsWith('{')) {
        const parsed = JSON.parse(rawVal);
        if (Array.isArray(parsed)) return parsed.join(', ');
        if (typeof parsed === 'object') return JSON.stringify(parsed);
      }
    } catch (e) {}
    return rawVal;
  };

  const totalCount = submissions.length;
  const pendingCount = submissions.filter((s) => (s.status || 'pending') === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesStatus =
      filterStatus === 'all' ? true : (sub.status || 'pending') === filterStatus;
    const matchesSearch =
      !searchQuery.trim() ||
      (sub.submitterEmail && sub.submitterEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sub.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.values(sub.answers).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  const renderStatusBadge = (status?: SubmissionStatus) => {
    const s = status || 'pending';
    if (s === 'approved') {
      return (
        <span className="response-status-badge approved">
          <Icon name="check-circle" size={13} />
          Approved
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="response-status-badge rejected">
          <Icon name="x-circle" size={13} />
          Rejected
        </span>
      );
    }
    return (
      <span className="response-status-badge pending">
        <Icon name="clock" size={13} />
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="responses-container">
        <div className="card loading-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="spinner" />
          <p>Loading form responses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="responses-container">
      {/* Header Toolbar */}
      <header className="dashboard-hero form-responses-hero" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onBack}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Icon name="arrow-left" size={14} /> Back
          </button>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '4px' }}>{formTitle}</h1>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              <span>{submissions.length} Total Submissions</span>
              {submissions.length > 0 && (
                <span>
                  {' '}• Latest:{' '}
                  {formatISTDate(submissions[0].submittedAt, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="mode-toggle">
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Table View
            </button>
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              Individual
            </button>
          </div>

          <Button3D
            variant="primary"
            size="md"
            icon={<Icon name="download" size={14} />}
            onClick={exportCSV}
            disabled={submissions.length === 0}
          >
            Export CSV
          </Button3D>
        </div>
      </header>

      {/* KPI Stats Bar: Total, Pending, Approved, Rejected */}
      {submissions.length > 0 && (
        <div className="response-kpi-bar">
          <div
            className={`response-kpi-chip ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            <span className="kpi-label">Total Responses</span>
            <span className="kpi-count">{totalCount}</span>
          </div>

          <div
            className={`response-kpi-chip pending-chip ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            <div className="kpi-icon-label">
              <Icon name="clock" size={14} />
              <span className="kpi-label">Pending</span>
            </div>
            <span className="kpi-count">{pendingCount}</span>
          </div>

          <div
            className={`response-kpi-chip approved-chip ${filterStatus === 'approved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('approved')}
          >
            <div className="kpi-icon-label">
              <Icon name="check-circle" size={14} />
              <span className="kpi-label">Approved</span>
            </div>
            <span className="kpi-count">{approvedCount}</span>
          </div>

          <div
            className={`response-kpi-chip rejected-chip ${filterStatus === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            <div className="kpi-icon-label">
              <Icon name="x-circle" size={14} />
              <span className="kpi-label">Rejected</span>
            </div>
            <span className="kpi-count">{rejectedCount}</span>
          </div>
        </div>
      )}

      {/* Action Notification Message */}
      {statusActionMessage && (
        <div className="response-status-toast">
          <Icon name="check-circle" size={16} />
          <span>{statusActionMessage}</span>
        </div>
      )}

      {error && <div className="auth-error-alert" style={{ marginBottom: '16px' }}>{error}</div>}

      {/* Submissions Filter & Search Control */}
      {submissions.length > 0 && (
        <div className="responses-controls-bar card" style={{ marginTop: '12px' }}>
          <div className="search-input-wrapper">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Filter by email, ID, or response value..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>

          <div className="status-filter-pills">
            <button
              type="button"
              className={`filter-pill ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              className={`filter-pill ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              className={`filter-pill ${filterStatus === 'approved' ? 'active' : ''}`}
              onClick={() => setFilterStatus('approved')}
            >
              Approved ({approvedCount})
            </button>
            <button
              type="button"
              className={`filter-pill ${filterStatus === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilterStatus('rejected')}
            >
              Rejected ({rejectedCount})
            </button>
          </div>
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="card empty-forms-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="empty-icon-box" style={{ margin: '0 auto 16px' }}>
            <Icon name="email" size={28} />
          </div>
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '8px' }}>No Submissions Yet</h2>
          <p style={{ maxWidth: '400px', margin: '0 auto' }}>
            Share your public form link with users to start receiving responses.
          </p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="card empty-forms-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            No submissions found matching the current filter or search criteria.
          </p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ marginTop: '12px' }}
            onClick={() => {
              setFilterStatus('all');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="responses-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                  <th>Submitter Email</th>
                  <th>IP Address</th>
                  {fields.map((f) => (
                    <th key={f.id}>{f.label}</th>
                  ))}
                  <th style={{ textAlign: 'right', minWidth: '180px' }}>Review Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub, i) => {
                  const currentStatus = sub.status || 'pending';
                  const isUpdating = updatingId === sub.id;

                  return (
                    <tr
                      key={sub.id}
                      className="table-row-interactive"
                      onClick={() => setActiveModalSubmission(sub)}
                    >
                      <td>{filteredSubmissions.length - i}</td>
                      <td>{renderStatusBadge(currentStatus)}</td>
                      <td className="time-cell">
                        {formatISTDate(sub.submittedAt, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{sub.submitterEmail || 'N/A'}</strong>
                      </td>
                      <td className="ip-cell">{sub.submitterIp || 'N/A'}</td>
                      {fields.map((f) => (
                        <td key={f.id} className="answer-cell">
                          {parseAnswerValue(sub.answers[f.id])}
                        </td>
                      ))}
                      <td style={{ textAlign: 'right' }}>
                        <div
                          className="table-action-btn-group"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className={`status-action-btn approve-btn ${currentStatus === 'approved' ? 'active' : ''}`}
                            disabled={isUpdating}
                            title="Approve response"
                            onClick={(e) => handleUpdateStatus(sub.id, 'approved', e)}
                          >
                            <Icon name="check" size={13} />
                            <span>{currentStatus === 'approved' ? 'Approved' : 'Approve'}</span>
                          </button>

                          <button
                            type="button"
                            className={`status-action-btn reject-btn ${currentStatus === 'rejected' ? 'active' : ''}`}
                            disabled={isUpdating}
                            title="Reject response"
                            onClick={(e) => handleUpdateStatus(sub.id, 'rejected', e)}
                          >
                            <Icon name="x" size={13} />
                            <span>{currentStatus === 'rejected' ? 'Rejected' : 'Reject'}</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--accent-primary)', fontWeight: 600, padding: '4px 8px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModalSubmission(sub);
                            }}
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="cards-view-shell" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={selectedIndex === 0}
              onClick={() => setSelectedIndex((prev) => prev - 1)}
            >
              <Icon name="arrow-left" size={13} /> Previous
            </button>
            <span>
              Response {selectedIndex + 1} of {filteredSubmissions.length}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={selectedIndex === filteredSubmissions.length - 1}
              onClick={() => setSelectedIndex((prev) => prev + 1)}
            >
              Next <Icon name="arrow-right" size={13} />
            </button>
          </div>

          {filteredSubmissions[selectedIndex] && (
            <div className="card" style={{ width: '100%', maxWidth: '680px', padding: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border-default)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {renderStatusBadge(filteredSubmissions[selectedIndex].status)}
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    Submitted {formatISTDate(filteredSubmissions[selectedIndex].submittedAt)}
                  </span>
                </div>

                <div className="submission-card-actions" style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${filteredSubmissions[selectedIndex].status === 'approved' ? 'btn-success' : 'btn-outline'}`}
                    onClick={() => handleUpdateStatus(filteredSubmissions[selectedIndex].id, 'approved')}
                  >
                    <Icon name="check-circle" size={14} /> Approve
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${filteredSubmissions[selectedIndex].status === 'rejected' ? 'btn-danger' : 'btn-outline'}`}
                    onClick={() => handleUpdateStatus(filteredSubmissions[selectedIndex].id, 'rejected')}
                  >
                    <Icon name="x-circle" size={14} /> Reject
                  </button>
                  {filteredSubmissions[selectedIndex].status !== 'pending' && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      title="Reset status to pending"
                      onClick={() => handleUpdateStatus(filteredSubmissions[selectedIndex].id, 'pending')}
                    >
                      <Icon name="clock" size={14} /> Pending
                    </button>
                  )}
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px 0',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)'
              }}>
                <span>
                  <strong style={{ color: 'var(--text-primary)' }}>Submitter:</strong>{' '}
                  {filteredSubmissions[selectedIndex].submitterEmail || 'N/A'}
                </span>
                <span>
                  <strong style={{ color: 'var(--text-primary)' }}>IP:</strong>{' '}
                  {filteredSubmissions[selectedIndex].submitterIp || 'N/A'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
                {fields.map((f) => {
                  const val = parseAnswerValue(filteredSubmissions[selectedIndex].answers[f.id]);
                  return (
                    <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                        {f.label} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '11px' }}>({f.fieldType})</span>
                      </div>
                      <div style={{
                        background: 'var(--bg-subtle)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-default)'
                      }}>
                        {f.fieldType === 'color' && val !== 'No response' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: val, border: '1px solid var(--border-strong)' }} />
                            <span>{val}</span>
                          </div>
                        ) : (
                          val
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAILED RESPONSE MODAL DIALOG */}
      {activeModalSubmission && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveModalSubmission(null)}
        >
          <div
            className="card modal-card detail-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detail-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h2 style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>Submission Details</h2>
                  {renderStatusBadge(activeModalSubmission.status)}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Submitted on {formatISTDate(activeModalSubmission.submittedAt)}
                </div>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setActiveModalSubmission(null)}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="detail-modal-body">
              <div style={{
                background: 'var(--bg-subtle)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-secondary)',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  Submitter: <strong style={{ color: 'var(--text-primary)' }}>{activeModalSubmission.submitterEmail || 'N/A'}</strong>
                </div>
                <div>
                  IP: <span style={{ color: 'var(--text-primary)' }}>{activeModalSubmission.submitterIp || 'N/A'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {fields.map((f, index) => {
                  const val = parseAnswerValue(activeModalSubmission.answers[f.id]);
                  return (
                    <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                        <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>{index + 1}.</span> {f.label}
                      </div>
                      <div style={{
                        background: 'var(--bg-subtle)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-default)'
                      }}>
                        {f.fieldType === 'color' && val !== 'No response' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: val, border: '1px solid var(--border-strong)' }} />
                            <span>{val}</span>
                          </div>
                        ) : (
                          val
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="detail-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${activeModalSubmission.status === 'approved' ? 'btn-success active-choice' : 'btn-outline'}`}
                  style={{
                    background: activeModalSubmission.status === 'approved' ? '#10b981' : undefined,
                    color: activeModalSubmission.status === 'approved' ? '#ffffff' : undefined,
                    borderColor: '#10b981'
                  }}
                  onClick={() => handleUpdateStatus(activeModalSubmission.id, 'approved')}
                >
                  <Icon name="check-circle" size={14} />
                  <span>{activeModalSubmission.status === 'approved' ? 'Approved' : 'Approve Response'}</span>
                </button>

                <button
                  type="button"
                  className={`btn btn-sm ${activeModalSubmission.status === 'rejected' ? 'btn-danger active-choice' : 'btn-outline'}`}
                  style={{
                    background: activeModalSubmission.status === 'rejected' ? '#ef4444' : undefined,
                    color: activeModalSubmission.status === 'rejected' ? '#ffffff' : undefined,
                    borderColor: '#ef4444'
                  }}
                  onClick={() => handleUpdateStatus(activeModalSubmission.id, 'rejected')}
                >
                  <Icon name="x-circle" size={14} />
                  <span>{activeModalSubmission.status === 'rejected' ? 'Rejected' : 'Reject Response'}</span>
                </button>

                {activeModalSubmission.status !== 'pending' && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleUpdateStatus(activeModalSubmission.id, 'pending')}
                  >
                    <Icon name="clock" size={13} /> Reset to Pending
                  </button>
                )}
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={() => setActiveModalSubmission(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
