import { FormEvent, useEffect, useState } from 'react';
import { FieldRenderer } from './components/fields/FieldRenderer';
import { StorageService } from './services/storage.service';
import { Icon } from './Icons';
import { Form } from './types';
import { Button3D } from './components/Button3D';
import { BrandLogo3D } from './components/BrandLogo3D';

interface PublicFormProps {
  shareId: string;
  apiUrl: string;
  onHomeClick?: () => void;
}

export function PublicForm({ shareId, apiUrl, onHomeClick }: PublicFormProps) {
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Submitter identity state
  const [submitterEmail, setSubmitterEmail] = useState(() => {
    const user = StorageService.getUser<{ email?: string }>();
    return user?.email || '';
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

    const isSingleSubmission = Boolean(form.singleSubmissionOnly);

    if ((isRestricted || isSingleSubmission) && (!submitterEmail.trim() || !/^\S+@\S+\.\S+$/.test(submitterEmail.trim()))) {
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

    const token = localStorage.getItem('formenclave_token') || localStorage.getItem('formguard_token') || localStorage.getItem('ember_token');
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
        if (response.status === 403 || data.message?.includes('already submitted') || data.message?.includes('authorized') || data.message?.includes('restricted')) {
          setAuthDenied(true);
          throw new Error(data.message || 'Access Denied / Submission Limit Reached.');
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
        <div className="public-form-container" style={{ paddingTop: '80px' }}>
          <div className="card loading-card" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" />
            <p>Loading form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="public-form-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        <div className="card public-card" style={{ textAlign: 'center', padding: '40px 32px', maxWidth: '480px', width: '100%', borderRadius: 'var(--radius-lg)' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
            }}
          >
            <Icon name="alert-circle" size={28} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>
            Form Unavailable
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>{error}</p>
          {onHomeClick && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button3D variant="primary" size="md" onClick={onHomeClick} style={{ minWidth: '160px' }}>
                Go to Home Page
              </Button3D>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isRestricted = Boolean(form?.accessType && form.accessType !== 'allow_all');
  const isSingleSubmission = Boolean(form?.singleSubmissionOnly);

  if (submitted) {
    return (
      <div className="public-form-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        <div className="card public-card" style={{ padding: '44px 36px', textAlign: 'center', maxWidth: '480px', width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 20px',
            }}
          >
            <Icon name="check" size={30} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>
            Response Submitted!
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0', lineHeight: 1.6 }}>
            Thank you for submitting your response for <strong style={{ color: 'var(--text-primary)' }}>{form?.title}</strong>.
          </p>

          {!isSingleSubmission && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <Button3D variant="primary" size="md" onClick={handleSubmitAnother}>
                Submit Another Response
              </Button3D>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="public-form-shell">
      <nav className="public-form-nav">
        <BrandLogo3D onClick={onHomeClick} logoSize={34} fontSize="17px" />
      </nav>

      <form className="public-form-container" onSubmit={handleSubmit}>
        <div className="card public-card" style={{ padding: '36px' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-default)' }}>
            <h1 className="public-form-title">{form?.title}</h1>
            {form?.description && (
              <p className="public-form-description">{form.description}</p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 500, marginTop: '12px' }}>
              <span>* Required field</span>
              {isRestricted && (
                <span className="access-status-badge allow_only">
                  <Icon name="lock" size={12} /> Restricted Access Form
                </span>
              )}
              {isSingleSubmission && (
                <span className="access-status-badge allow_only" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-primary)', borderColor: 'var(--accent-border)' }}>
                  <Icon name="check" size={12} /> Limit 1 Response
                </span>
              )}
            </div>
          </div>

          {/* Submitter Email Verification Card */}
          {(isRestricted || isSingleSubmission) && (
            <div style={{
              marginBottom: '24px',
              padding: '16px 20px',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)'
            }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Your Email Address <span style={{ color: 'var(--destructive)' }}>*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. name@domain.com"
                value={submitterEmail}
                onChange={(e) => setSubmitterEmail(e.target.value)}
                required
              />
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '6px' }}>
                {isSingleSubmission
                  ? 'This form is limited to 1 response per respondent. Your email will be verified to prevent duplicate submissions.'
                  : 'Only authorized email addresses whitelisted by the form creator can submit.'}
              </div>
            </div>
          )}

          {error && (
            <div className={`auth-error-alert ${authDenied ? 'alert-danger-prominent' : ''}`} style={{ marginBottom: '24px' }}>
              {authDenied ? (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Icon name="block" size={20} />
                  <div>
                    <h4 style={{ margin: '0 0 2px', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                      Submission Not Allowed
                    </h4>
                    <p style={{ margin: 0, fontSize: 'var(--font-size-xs)' }}>
                      {error}
                    </p>
                  </div>
                </div>
              ) : (
                error
              )}
            </div>
          )}

          {/* Dynamic Input Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {form?.fields?.map((field) => (
              <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="field-label" style={{ fontWeight: 600, fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
                  {field.label}
                  {field.isRequired && <span style={{ color: 'var(--destructive)' }}> *</span>}
                </label>

                {field.helpText && (
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{field.helpText}</div>
                )}

                <div className="field-input-box">
                  <FieldRenderer
                    field={field}
                    value={answers[field.id]}
                    onChange={(val) => handleFieldChange(field.id, val)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Form Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '32px', justifyContent: 'flex-end' }}>
            <Button3D variant="ghost" size="md" onClick={handleReset} disabled={submitting}>
              Clear Form
            </Button3D>
            <Button3D
              variant="primary"
              size="md"
              loading={submitting}
              type="submit"
            >
              Submit Response
            </Button3D>
          </div>
        </div>
      </form>
    </div>
  );
}
