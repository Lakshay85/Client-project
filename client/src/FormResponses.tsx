import { useEffect, useState } from 'react';
import { Icon } from './Icons';
import { FormField, FormSubmission } from './types';
import { TiltCard } from './components/TiltCard';
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

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="card loading-card">
          <div className="spinner"></div>
          <p>Loading form responses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="responses-container">
      {/* Header Toolbar */}
      <header className="responses-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button3D variant="ghost" size="sm" icon={<Icon name="arrow-left" size={15} />} onClick={onBack}>
            Back
          </Button3D>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>{formTitle}</h1>
            <div className="responses-meta-subtitle" style={{ fontSize: '13px', color: 'var(--slate-500)', fontWeight: 600 }}>
              <span>{submissions.length} Total Submissions</span>
              {submissions.length > 0 && (
                <span>
                  {' '}• Latest:{' '}
                  {formatISTDate(submissions[0].submittedAt, {
                    month: 'numeric',
                    day: 'numeric',
                    year: '2-digit',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="view-switch" style={{ display: 'flex', gap: '4px', background: 'rgba(15, 23, 42, 0.7)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Button3D
              variant={viewMode === 'table' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table View
            </Button3D>
            <Button3D
              variant={viewMode === 'cards' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              Individual
            </Button3D>
          </div>

          <Button3D
            variant="primary"
            size="md"
            icon={<Icon name="download" size={15} />}
            onClick={exportCSV}
            disabled={submissions.length === 0}
            style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)' }}
          >
            Export CSV
          </Button3D>
        </div>
      </header>

      {error && <div className="form-error">{error}</div>}

      {submissions.length === 0 ? (
        <TiltCard maxRotateX={6} maxRotateY={6}>
          <div className="empty-responses-card" style={{ padding: '48px', textAlign: 'center', color: '#ffffff' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="email" size={32} />
            </div>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 800, margin: '0 0 8px' }}>No Submissions Yet</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Share your public form link with users to start receiving responses.</p>
          </div>
        </TiltCard>
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
                        month: 'numeric',
                        day: 'numeric',
                        year: '2-digit',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </td>
                    <td className="email-cell">
                      <strong>{sub.submitterEmail || 'N/A'}</strong>
                    </td>
                    <td className="ip-cell">{sub.submitterIp || 'N/A'}</td>
                    {fields.map((f) => (
                      <td key={f.id} className="answer-cell">
                        {parseAnswerValue(sub.answers[f.id])}
                      </td>
                    ))}
                    <td>
                      <button
                        className="text-button btn-sm view-detail-btn"
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
        <div className="cards-view-shell">
          <div className="pagination-nav">
            <button
              className="text-button"
              disabled={selectedIndex === 0}
              onClick={() => setSelectedIndex((prev) => prev - 1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon name="arrow-left" size={14} /> Previous Response
            </button>
            <span>
              Response {selectedIndex + 1} of {submissions.length}
            </span>
            <button
              className="text-button"
              disabled={selectedIndex === submissions.length - 1}
              onClick={() => setSelectedIndex((prev) => prev + 1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              Next Response <Icon name="arrow-right" size={14} />
            </button>
          </div>

          {submissions[selectedIndex] && (
            <div className="card response-card-detail">
              <div className="detail-meta">
                <span>
                  <strong>Submitter Email:</strong>{' '}
                  {submissions[selectedIndex].submitterEmail || 'N/A'}
                </span>
                <span>
                  <strong>Submitted:</strong>{' '}
                  {formatISTDate(submissions[selectedIndex].submittedAt)}
                </span>
                <span>
                  <strong>Submitter IP:</strong>{' '}
                  {submissions[selectedIndex].submitterIp || 'N/A'}
                </span>
              </div>

              <div className="detail-qa-list">
                {fields.map((f) => {
                  const val = parseAnswerValue(submissions[selectedIndex].answers[f.id]);
                  return (
                    <div key={f.id} className="qa-item">
                      <div className="qa-question">
                        {f.label} <span className="qa-type">({f.fieldType})</span>
                      </div>
                      <div className="qa-answer">
                        {f.fieldType === 'color' && val !== 'No response' ? (
                          <div className="color-answer-box">
                            <span
                              className="color-swatch-lg"
                              style={{ backgroundColor: val }}
                            ></span>
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
                <h2>Submission Details</h2>
                <div className="modal-subtext">
                  Submitted by {activeModalSubmission.submitterEmail || 'N/A'} on {formatISTDate(activeModalSubmission.submittedAt)}
                </div>
              </div>
              <button
                className="icon-btn close-modal-btn"
                onClick={() => setActiveModalSubmission(null)}
              >
                ✕
              </button>
            </div>

            <div className="detail-modal-body">
              <div className="modal-ip-badge">
                Submitter Email: <strong>{activeModalSubmission.submitterEmail || 'N/A'}</strong> | IP: {activeModalSubmission.submitterIp || 'N/A'}
              </div>

              <div className="detail-qa-list">
                {fields.map((f, index) => {
                  const val = parseAnswerValue(activeModalSubmission.answers[f.id]);
                  return (
                    <div key={f.id} className="qa-item">
                      <div className="qa-question">
                        <span className="q-num">{index + 1}.</span> {f.label}
                      </div>
                      <div className="qa-answer">
                        {f.fieldType === 'color' && val !== 'No response' ? (
                          <div className="color-answer-box">
                            <span
                              className="color-swatch-lg"
                              style={{ backgroundColor: val }}
                            ></span>
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
                className="dark-button"
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
