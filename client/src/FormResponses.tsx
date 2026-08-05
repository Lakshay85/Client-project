import { useEffect, useState } from 'react';
import { Icon } from './Icons';
import { FormField, FormSubmission } from './types';

interface FormResponsesProps {
  formId: string;
  token: string;
  apiUrl: string;
  onBack: () => void;
}

type ViewMode = 'summary' | 'table' | 'cards';

export function FormResponses({ formId, token, apiUrl, onBack }: FormResponsesProps) {
  const [formTitle, setFormTitle] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
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
        new Date(sub.submittedAt).toLocaleString(),
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
      <header className="responses-header">
        <div className="header-left">
          <button className="text-button back-btn" onClick={onBack}>
            ← Dashboard
          </button>
          <div>
            <h1>{formTitle}</h1>
            <div className="responses-meta-subtitle">
              <span>{submissions.length} Total Submissions</span>
              {submissions.length > 0 && (
                <span>
                  • Latest response:{' '}
                  {new Date(submissions[0].submittedAt).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div className="view-switch">
            <button
              className={`switch-btn ${viewMode === 'summary' ? 'active' : ''}`}
              onClick={() => setViewMode('summary')}
            >
              <Icon name="chart" size={14} /> Question Summary
            </button>
            <button
              className={`switch-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Submissions Table
            </button>
            <button
              className={`switch-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              Individual Inspector
            </button>
          </div>

          <button
            className="dark-button export-btn"
            onClick={exportCSV}
            disabled={submissions.length === 0}
          >
            Export CSV
          </button>
        </div>
      </header>

      {error && <div className="form-error">{error}</div>}

      {submissions.length === 0 ? (
        <div className="card empty-responses-card">
          <div className="empty-icon-box">
            <Icon name="email" size={32} />
          </div>
          <h2>No Submissions Yet</h2>
          <p>Share your form link with respondents to start gathering entries.</p>
        </div>
      ) : viewMode === 'summary' ? (
        <div className="summary-view-grid">
          <div className="metrics-banner">
            <div className="metric-box">
              <div className="metric-icon-badge">
                <Icon name="email" size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-num">{submissions.length}</span>
                <span className="metric-label">Total Responses</span>
              </div>
            </div>
            <div className="metric-box">
              <div className="metric-icon-badge secondary">
                <Icon name="grid" size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-num">{fields.length}</span>
                <span className="metric-label">Form Questions</span>
              </div>
            </div>
            <div className="metric-box">
              <div className="metric-icon-badge accent">
                <Icon name="check" size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-num">100%</span>
                <span className="metric-label">Completion Status</span>
              </div>
            </div>
          </div>

          <div className="question-summaries-list">
            {fields.map((field, idx) => {
              const fieldAnswers = submissions.map((s) => parseAnswerValue(s.answers[field.id]));
              const validAnswers = fieldAnswers.filter((a) => a !== 'No response');

              const frequencyMap: Record<string, number> = {};
              validAnswers.forEach((ans) => {
                const items = ['radio', 'checkbox', 'select'].includes(field.fieldType)
                  ? ans.split(', ')
                  : [ans];
                items.forEach((item) => {
                  frequencyMap[item] = (frequencyMap[item] || 0) + 1;
                });
              });

              return (
                <div key={field.id} className="card question-summary-card">
                  <div className="summary-card-header">
                    <span className="q-number">Question {idx + 1}</span>
                    <span className="q-type-badge">{field.fieldType}</span>
                  </div>
                  <h3 className="summary-q-title">{field.label}</h3>
                  <div className="summary-q-meta">
                    {validAnswers.length} responses ({submissions.length - validAnswers.length} skipped)
                  </div>

                  {['radio', 'checkbox', 'select', 'toggle'].includes(field.fieldType) ? (
                    <div className="breakdown-bars">
                      {Object.entries(frequencyMap).map(([option, count]) => {
                        const percent = Math.round((count / Math.max(1, submissions.length)) * 100);
                        return (
                          <div key={option} className="bar-row">
                            <div className="bar-label-group">
                              <span className="option-name">{option}</span>
                              <span className="option-stat">
                                {count} ({percent}%)
                              </span>
                            </div>
                            <div className="bar-track">
                              <div
                                className="bar-fill"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="response-stream">
                      {validAnswers.slice(0, 8).map((ans, i) => (
                        <div key={i} className="stream-badge">
                          {field.fieldType === 'color' ? (
                            <span className="color-preview-chip">
                              <span
                                className="swatch"
                                style={{ backgroundColor: ans }}
                              ></span>
                              {ans}
                            </span>
                          ) : (
                            ans
                          )}
                        </div>
                      ))}
                      {validAnswers.length > 8 && (
                        <span className="more-responses-count">
                          + {validAnswers.length - 8} more responses
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="responses-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Submitted At</th>
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
                      {new Date(sub.submittedAt).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
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
            >
              ← Previous Response
            </button>
            <span>
              Response {selectedIndex + 1} of {submissions.length}
            </span>
            <button
              className="text-button"
              disabled={selectedIndex === submissions.length - 1}
              onClick={() => setSelectedIndex((prev) => prev + 1)}
            >
              Next Response →
            </button>
          </div>

          {submissions[selectedIndex] && (
            <div className="card response-card-detail">
              <div className="detail-meta">
                <span>
                  <strong>Submitted:</strong>{' '}
                  {new Date(submissions[selectedIndex].submittedAt).toLocaleString()}
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
                  Submitted on {new Date(activeModalSubmission.submittedAt).toLocaleString()}
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
                Submitter IP: {activeModalSubmission.submitterIp || 'N/A'}
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
