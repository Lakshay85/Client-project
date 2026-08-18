import { useEffect, useState } from 'react';
import { Icon } from './Icons';
import { FormField, FormSubmission } from './types';
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
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeModalSubmission, setActiveModalSubmission] = useState<FormSubmission | null>(null);

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

  const exportCSV = () => {
    if (submissions.length === 0) return;
    const content = exportCSVContent(formTitle, fields, submissions);
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
      <header className="dashboard-hero" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
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

      {error && <div className="auth-error-alert" style={{ marginBottom: '16px' }}>{error}</div>}

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
      ) : viewMode === 'table' ? (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="responses-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Submitted At</th>
                  <th>Submitter Email</th>
                  <th>IP Address</th>
                  {fields.map((f) => (
                    <th key={f.id}>{f.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => (
                  <tr
                    key={sub.id}
                    className="table-row-interactive"
                    onClick={() => setActiveModalSubmission(sub)}
                  >
                    <td>{submissions.length - i}</td>
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
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--accent-primary)', fontWeight: 600 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalSubmission(sub);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
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
              Response {selectedIndex + 1} of {submissions.length}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={selectedIndex === submissions.length - 1}
              onClick={() => setSelectedIndex((prev) => prev + 1)}
            >
              Next <Icon name="arrow-right" size={13} />
            </button>
          </div>

          {submissions[selectedIndex] && (
            <div className="card" style={{ width: '100%', maxWidth: '680px', padding: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border-default)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)'
              }}>
                <span>
                  <strong style={{ color: 'var(--text-primary)' }}>Submitter:</strong>{' '}
                  {submissions[selectedIndex].submitterEmail || 'N/A'}
                </span>
                <span>
                  <strong style={{ color: 'var(--text-primary)' }}>Date:</strong>{' '}
                  {formatISTDate(submissions[selectedIndex].submittedAt)}
                </span>
                <span>
                  <strong style={{ color: 'var(--text-primary)' }}>IP:</strong>{' '}
                  {submissions[selectedIndex].submitterIp || 'N/A'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                {fields.map((f) => {
                  const val = parseAnswerValue(submissions[selectedIndex].answers[f.id]);
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
                <h2 style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>Submission Details</h2>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
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
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-secondary)',
                marginBottom: '16px'
              }}>
                Submitter: <strong style={{ color: 'var(--text-primary)' }}>{activeModalSubmission.submitterEmail || 'N/A'}</strong> | IP: {activeModalSubmission.submitterIp || 'N/A'}
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

            <div className="detail-modal-footer">
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
