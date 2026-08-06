import { FormEvent, useEffect, useState } from 'react';
import { RenderFieldInput } from './FormBuilder';
import { Icon } from './Icons';
import { Form } from './types';

interface PublicFormProps {
  shareId: string;
  apiUrl: string;
  onHomeClick?: () => void;
}

export function PublicForm({ shareId, apiUrl, onHomeClick }: PublicFormProps) {
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Submitter identity state - prefilled from logged-in user if available
  const [submitterEmail, setSubmitterEmail] = useState(() => {
    const savedUser = localStorage.getItem('formguard_user') || localStorage.getItem('ember_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.email) return u.email;
      } catch (e) {}
    }
    return '';
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [authDenied, setAuthDenied] = useState(false);

  useEffect(() => {
    fetchForm();
  }, [shareId]);

  const fetchForm = async () => {
    setLoading(true);
    setError('');
    setAuthDenied(false);
    try {
      const response = await fetch(`${apiUrl}/api/public/forms/${shareId}`);
      const data = (await response.json()) as { form?: Form; message?: string };
      if (!response.ok || !data.form) {
        throw new Error(data.message || 'Form not found or no longer available.');
      }
      setForm(data.form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load form.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, val: any) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: val
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form || !form.fields) return;

    if (!submitterEmail.trim() || !/^\S+@\S+\.\S+$/.test(submitterEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    for (const field of form.fields) {
      if (field.isRequired) {
        const val = answers[field.id];
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          setError(`"${field.label}" is required.`);
          return;
        }
      }
    }

    setError('');
    setAuthDenied(false);
    setSubmitting(true);

    const token = localStorage.getItem('formguard_token') || localStorage.getItem('ember_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${apiUrl}/api/public/forms/${shareId}/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          submitterEmail: submitterEmail.trim(),
          answers
        })
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        if (response.status === 403 || data.message?.includes('authorized')) {
          setAuthDenied(true);
          throw new Error('You are not authorized to submit this form.');
        }
        throw new Error(data.message || 'Failed to submit response.');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setError('');
    setAuthDenied(false);
  };

  const handleSubmitAnother = () => {
    setAnswers({});
    setSubmitted(false);
    setError('');
    setAuthDenied(false);
  };

  if (loading) {
    return (
      <div className="public-form-shell">
        <div className="public-card loading-card">
          <div className="spinner"></div>
          <p>Loading form...</p>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="public-form-shell">
        <div className="public-card error-card">
          <h2>Form Unavailable</h2>
          <p>{error}</p>
          {onHomeClick && (
            <button className="coral-button" onClick={onHomeClick}>
              Go to Home Page
            </button>
          )}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="public-form-shell">
        <div className="public-card success-card">
          <div className="success-icon">
            <Icon name="check" size={32} />
          </div>
          <h2>Response Submitted!</h2>
          <p>Thank you for submitting your response for <strong>{form?.title}</strong>.</p>
          <div className="success-actions">
            <button className="coral-button" onClick={handleSubmitAnother}>
              Submit another response
            </button>
            {onHomeClick && (
              <button className="text-button" onClick={onHomeClick}>
                Back to Home
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isRestricted = form?.accessType && form.accessType !== 'allow_all';

  return (
    <div className="public-form-shell">
      <nav className="public-form-nav">
        <a className="brand" onClick={onHomeClick}>
          <div className="brand-logo-icon">F</div>
          form<span>Guard</span>
        </a>
      </nav>

      <form className="public-form-container" onSubmit={handleSubmit}>
        {/* Header Card */}
        <div className="public-card form-header-card">
          <h1 className="public-form-title">{form?.title}</h1>
          {form?.description && (
            <p className="public-form-description">{form.description}</p>
          )}
          <div className="public-form-meta">
            <span>* Indicates required field</span>
            {isRestricted && (
              <span className="access-badge-pill">
                🔒 Restricted Access Form
              </span>
            )}
          </div>
        </div>

        {/* Submitter Email Verification Card */}
        <div className="public-card field-card submitter-identity-card">
          <div className="identity-card-header">
            <label className="field-label">
              Your Email Address <span className="required-star">*</span>
            </label>
            <span className="identity-help-badge">Required for form submission verification</span>
          </div>

          <input
            type="email"
            placeholder="e.g. name@domain.com"
            value={submitterEmail}
            onChange={(e) => setSubmitterEmail(e.target.value)}
            required
            className="submitter-email-input"
          />
          <div className="field-help-text">
            {isRestricted
              ? 'This form has submission access control enabled. Only authorized email IDs can submit.'
              : 'Your email address will be linked to your response.'}
          </div>
        </div>

        {error && (
          <div className={`public-alert ${authDenied ? 'alert-danger-prominent' : 'error'}`}>
            {authDenied ? (
              <div className="auth-denied-box">
                <div className="denied-icon">🚫</div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700 }}>
                    You are not authorized to submit this form.
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    The email ID (<strong>{submitterEmail || 'provided'}</strong>) does not have permission from the form creator to submit responses for this form.
                  </p>
                </div>
              </div>
            ) : (
              error
            )}
          </div>
        )}

        {/* Dynamic Fields */}
        {form?.fields?.map((field) => (
          <div key={field.id} className="public-card field-card">
            <label className="field-label">
              {field.label}
              {field.isRequired && <span className="required-star"> *</span>}
            </label>

            {field.helpText && (
              <div className="field-help-text">{field.helpText}</div>
            )}

            <div className="field-input-box">
              <RenderFieldInput
                field={field}
                value={answers[field.id]}
                onChange={(val) => handleFieldChange(field.id, val)}
              />
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="public-form-footer">
          <button
            type="submit"
            className="coral-button submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
          <button
            type="button"
            className="text-button clear-btn"
            onClick={handleReset}
            disabled={submitting}
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}
