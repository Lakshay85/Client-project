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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchForm();
  }, [shareId]);

  const fetchForm = async () => {
    setLoading(true);
    setError('');
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
    setSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/api/public/forms/${shareId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
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
  };

  const handleSubmitAnother = () => {
    setAnswers({});
    setSubmitted(false);
    setError('');
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
          </div>
        </div>

        {error && <div className="public-alert error">{error}</div>}

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
