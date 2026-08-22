import { useState } from 'react';
import { FormField, FieldTemplate } from '../types';

/**
 * Custom hook encapsulating all FormBuilder state and field operations.
 * Extracted from FormBuilder.tsx to separate state management from UI.
 */
export function useFormBuilder(options: {
  initialTitle?: string;
  initialDescription?: string;
  initialFields?: FormField[];
  initialAccessType?: 'allow_all' | 'allow_only' | 'restrict_specific';
  initialRestrictedEmails?: string[];
  initialSingleSubmissionOnly?: boolean;
}) {
  const [title, setTitle] = useState(options.initialTitle || 'Untitled Form');
  const [description, setDescription] = useState(
    options.initialDescription ?? 'Please fill out this form to submit your details.'
  );
  const [accessType, setAccessType] = useState<'allow_all' | 'allow_only' | 'restrict_specific'>(
    options.initialAccessType || 'allow_all'
  );
  const [restrictedEmails, setRestrictedEmails] = useState<string[]>(
    options.initialRestrictedEmails || []
  );
  const [singleSubmissionOnly, setSingleSubmissionOnly] = useState<boolean>(
    options.initialSingleSubmissionOnly !== undefined ? options.initialSingleSubmissionOnly : true
  );
  const [emailInput, setEmailInput] = useState('');

  const [fields, setFields] = useState<FormField[]>(() => {
    if (options.initialFields && options.initialFields.length > 0) {
      return options.initialFields.map((f, i) => ({
        ...f,
        id: f.id || crypto.randomUUID(),
        sortOrder: i,
      }));
    }
    return [
      {
        id: crypto.randomUUID(),
        label: 'Full Name',
        fieldType: 'text',
        placeholder: 'Enter your full name',
        isRequired: true,
        sortOrder: 0,
      },
      {
        id: crypto.randomUUID(),
        label: 'Email Address',
        fieldType: 'email',
        placeholder: 'your.name@example.com',
        isRequired: true,
        sortOrder: 1,
      },
      {
        id: crypto.randomUUID(),
        label: 'Preferred Date',
        fieldType: 'date',
        helpText: 'Select your preferred appointment date',
        isRequired: false,
        sortOrder: 2,
      },
    ];
  });

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(fields[0]?.id || null);

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  // Email tag management
  const addEmailTag = (emailStr?: string) => {
    const target = typeof emailStr === 'string' && emailStr.trim() ? emailStr : emailInput;
    if (!target || typeof target !== 'string') return;
    const parsed = target
      .split(/[\s,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && /^\S+@\S+\.\S+$/.test(e));

    if (parsed.length > 0) {
      const unique = Array.from(new Set([...restrictedEmails, ...parsed]));
      setRestrictedEmails(unique);
      setEmailInput('');
    }
  };

  const removeEmailTag = (emailToRemove: string) => {
    setRestrictedEmails(restrictedEmails.filter((e) => e !== emailToRemove));
  };

  // Field operations
  const addFieldFromTemplate = (template: FieldTemplate, targetIndex?: number) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      label: template.defaultLabel,
      fieldType: template.type,
      placeholder: template.defaultPlaceholder || '',
      helpText: '',
      isRequired: false,
      options: template.defaultOptions ? [...template.defaultOptions] : undefined,
      config: template.defaultConfig ? { ...template.defaultConfig } : undefined,
      sortOrder: fields.length,
    };

    if (targetIndex !== undefined && targetIndex >= 0) {
      const updated = [...fields];
      updated.splice(targetIndex, 0, newField);
      setFields(updated.map((f, i) => ({ ...f, sortOrder: i })));
    } else {
      setFields([...fields, newField]);
    }
    setSelectedFieldId(newField.id);
  };

  const updateSelectedField = (updates: Partial<FormField>) => {
    if (!selectedFieldId) return;
    setFields(fields.map((f) => (f.id === selectedFieldId ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    const next = fields.filter((f) => f.id !== id);
    setFields(next);
    if (selectedFieldId === id) {
      setSelectedFieldId(next.length > 0 ? next[0].id : null);
    }
  };

  const duplicateField = (field: FormField) => {
    const index = fields.findIndex((f) => f.id === field.id);
    const copy: FormField = {
      ...field,
      id: crypto.randomUUID(),
      label: `${field.label} (Copy)`,
      options: field.options ? [...field.options] : undefined,
      config: field.config ? { ...field.config } : undefined,
    };
    const updated = [...fields];
    updated.splice(index + 1, 0, copy);
    setFields(updated.map((f, i) => ({ ...f, sortOrder: i })));
    setSelectedFieldId(copy.id);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFields(updated.map((f, i) => ({ ...f, sortOrder: i })));
  };

  return {
    // Form metadata
    title, setTitle,
    description, setDescription,
    accessType, setAccessType,
    restrictedEmails, setRestrictedEmails,
    singleSubmissionOnly, setSingleSubmissionOnly,
    emailInput, setEmailInput,

    // Fields
    fields, setFields,
    selectedFieldId, setSelectedFieldId,
    selectedField,

    // Email operations
    addEmailTag,
    removeEmailTag,

    // Field operations
    addFieldFromTemplate,
    updateSelectedField,
    removeField,
    duplicateField,
    moveField,
  };
}
