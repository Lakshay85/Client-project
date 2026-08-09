import { FormEvent, useEffect, useState } from 'react';
import { RenderFieldInput } from './FormBuilder';
import { Icon } from './Icons';
import { Form } from './types';
import { TiltCard } from './components/TiltCard';
import { Button3D } from './components/Button3D';

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
    const savedUser = localStorage.getItem('formenclave_user') || localStorage.getItem('formguard_user') || localStorage.getItem('ember_user');
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

    if (isRestricted && (!submitterEmail.trim() || !/^\S+@\S+\.\S+$/.test(submitterEmail.trim()))) {
      setError('Please enter a valid email address for access permission verification.');
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
      <div className="public-form-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'radial-gradient(ellipse at 50% 20%, #1e293b 0%, #0a0d14 100%)' }}>
        <TiltCard maxRotateX={8} maxRotateY={8} glowColor="rgba(16, 185, 129, 0.4)">
          <div className="public-card success-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px' }}>
            <div className="success-icon" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 20px', boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)' }}>
              <Icon name="check" size={32} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--slate-900)', margin: '0 0 8px' }}>Response Submitted!</h2>
            <p style={{ color: 'var(--slate-600)', fontSize: '15px', margin: '0 0 24px', lineHeight: 1.5 }}>
              Thank you for submitting your response for <strong style={{ color: 'var(--primary)' }}>{form?.title}</strong>.
            </p>
            <div className="success-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button3D variant="primary" size="md" onClick={handleSubmitAnother}>
                Submit Another Response
              </Button3D>
              {onHomeClick && (
                <Button3D variant="outline" size="md" onClick={onHomeClick}>
                  Back to Home
                </Button3D>
              )}
            </div>
          </div>
        </TiltCard>
      </div>
    );
  }

  const isRestricted = form?.accessType && form.accessType !== 'allow_all';
  const filledCount = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== '').length;
  const totalFields = form?.fields?.length || 1;
  const progressPercent = Math.min(100, Math.round((filledCount / totalFields) * 100));

  return (
    <div className="public-form-shell" style={{ minHeight: '100vh', padding: '30px 20px 60px', background: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0a0d14 100%)', position: 'relative', overflow: 'hidden' }}>
      <div className="orb-bg" style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13, 148, 136, 0.25) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <nav className="public-form-nav" style={{ maxWidth: '680px', margin: '0 auto 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <a className="brand" onClick={onHomeClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Form Enclave Logo" className="brand-logo-img" style={{ width: '28px', height: '28px' }} />
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>form<span style={{ color: '#2dd4bf' }}>Enclave</span></span>
        </a>
      </nav>

      <form className="public-form-container" onSubmit={handleSubmit} style={{ maxWidth: '680px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* 3D Progress Bar */}
        <div style={{ marginBottom: '20px', background: 'rgba(255, 255, 255, 0.1)', padding: '12px 16px', borderRadius: '14px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#5eead4', marginBottom: '6px' }}>
            <span>PROGRESS</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #2dd4bf, #06b6d4)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        <TiltCard maxRotateX={6} maxRotateY={6} glowColor="rgba(6, 182, 212, 0.3)">
          <div className="clay-card" style={{ padding: '32px' }}>
            {/* Header */}
            <div className="form-header-card" style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>{form?.title}</h1>
              {form?.description && (
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 16px', lineHeight: 1.6 }}>{form.description}</p>
              )}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', color: 'var(--slate-500)', fontWeight: 600 }}>
                <span>* Required field</span>
                {isRestricted && (
                  <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name="lock" size={13} /> Restricted Access Form
                  </span>
                )}
              </div>
            </div>

            {/* Submitter Email Verification Card */}
            {isRestricted && (
              <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(240, 253, 250, 0.6)', borderRadius: '14px', border: '1px solid var(--primary-border)' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '6px' }}>
                  Security Verification: Your Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. name@domain.com"
                  value={submitterEmail}
                  onChange={(e) => setSubmitterEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--slate-300)', fontSize: '14px', outline: 'none' }}
                />
                <div style={{ fontSize: '12px', color: 'var(--slate-600)', marginTop: '6px' }}>
                  Only authorized email addresses whitelisted by the form creator can submit.
                </div>
              </div>
            )}

            {error && (
              <div className={`public-alert ${authDenied ? 'alert-danger-prominent' : 'error'}`} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', marginBottom: '24px' }}>
                {authDenied ? (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ color: '#dc2626' }}><Icon name="block" size={24} /></div>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700 }}>
                        Access Denied
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px' }}>
                        The email ID (<strong>{submitterEmail || 'provided'}</strong>) does not have permission to submit this form.
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
                <div key={field.id} className="field-card" style={{ padding: '20px', borderRadius: '12px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '4px' }}>
                    {field.label}
                    {field.isRequired && <span style={{ color: '#ef4444' }}> *</span>}
                  </label>

                  {field.helpText && (
                    <div style={{ fontSize: '12px', color: 'var(--slate-500)', marginBottom: '8px' }}>{field.helpText}</div>
                  )}

                  <div className="field-input-box" style={{ marginTop: '8px' }}>
                    <RenderFieldInput
                      field={field}
                      value={answers[field.id]}
                      onChange={(val) => handleFieldChange(field.id, val)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Form Action Buttons */}
            <div className="public-form-footer" style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end' }}>
              <Button3D variant="ghost" size="md" onClick={handleReset} disabled={submitting}>
                Clear Form
              </Button3D>
              <Button3D
                variant="primary"
                size="md"
                icon={<Icon name="zap" size={15} />}
                loading={submitting}
                type="submit"
                style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)' }}
              >
                Submit Response
              </Button3D>
            </div>
          </div>
        </TiltCard>
      </form>
    </div>
  );
}
