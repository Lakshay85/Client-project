import { useState } from 'react';
import { FormField } from '../types';

/**
 * Custom hook for form publish/save logic.
 */
export function useFormPublish(options: {
  token: string;
  apiUrl: string;
  formId?: string;
  onFormCreated: (shareId: string) => void;
}) {
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const handlePublish = async (params: {
    title: string;
    description: string;
    accessType: string;
    restrictedEmails: string[];
    singleSubmissionOnly: boolean;
    emailInput: string;
    fields: FormField[];
  }) => {
    const { title, description, accessType, restrictedEmails, singleSubmissionOnly, emailInput, fields } = params;

    if (!title.trim()) {
      setError('Please provide a form title.');
      return;
    }
    if (fields.length === 0) {
      setError('Please add at least one field to your form.');
      return;
    }

    // Auto-add leftover email in input field if present
    let finalEmails = [...restrictedEmails];
    if (emailInput.trim()) {
      const parsed = emailInput
        .split(/[\s,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e && /^\S+@\S+\.\S+$/.test(e));
      finalEmails = Array.from(new Set([...finalEmails, ...parsed]));
    }

    if (accessType !== 'allow_all' && finalEmails.length === 0) {
      setError(
        `Please add at least one email address for ${
          accessType === 'allow_only' ? 'allowing' : 'restricting'
        } submissions.`
      );
      return;
    }

    setError('');
    setPublishing(true);

    try {
      const endpoint = options.formId
        ? `${options.apiUrl}/api/forms/${options.formId}`
        : `${options.apiUrl}/api/forms`;
      const method = options.formId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${options.token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          accessType,
          restrictedEmails: finalEmails,
          singleSubmissionOnly,
          fields: fields.map((f) => ({
            id: f.id,
            label: f.label,
            fieldType: f.fieldType,
            placeholder: f.placeholder,
            helpText: f.helpText,
            isRequired: f.isRequired,
            options: f.options,
            config: f.config,
          })),
        }),
      });

      const data = (await response.json()) as {
        form?: { shareId?: string; id?: string };
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save form.');
      }

      options.onFormCreated(data.form?.shareId || options.formId || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish form.');
    } finally {
      setPublishing(false);
    }
  };

  return { publishing, error, setError, handlePublish };
}
