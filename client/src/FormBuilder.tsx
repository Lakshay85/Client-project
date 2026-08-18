import { useState, DragEvent } from 'react';
import { FIELD_TEMPLATES } from './fieldTemplates';
import { Icon } from './Icons';
import { FieldTemplate, FormField, FieldType } from './types';
import { TiltCard } from './components/TiltCard';
import { Button3D } from './components/Button3D';
import { ThemeToggle } from './components/ThemeToggle';

interface FormBuilderProps {
  token: string;
  apiUrl: string;
  onBack: () => void;
  onFormCreated: (shareId: string) => void;
  formId?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialFields?: FormField[];
  initialAccessType?: 'allow_all' | 'allow_only' | 'restrict_specific';
  initialRestrictedEmails?: string[];
  initialSingleSubmissionOnly?: boolean;
}

export function FormBuilder({
  token,
  apiUrl,
  onBack,
  onFormCreated,
  formId,
  initialTitle,
  initialDescription,
  initialFields,
  initialAccessType = 'allow_all',
  initialRestrictedEmails = [],
  initialSingleSubmissionOnly = true
}: FormBuilderProps) {
  const [title, setTitle] = useState(initialTitle || 'Untitled Form');
  const [description, setDescription] = useState(
    initialDescription ?? 'Please fill out this form to submit your details.'
  );
  const [accessType, setAccessType] = useState<'allow_all' | 'allow_only' | 'restrict_specific'>(
    initialAccessType
  );
  const [restrictedEmails, setRestrictedEmails] = useState<string[]>(initialRestrictedEmails);
  const [singleSubmissionOnly, setSingleSubmissionOnly] = useState<boolean>(
    initialSingleSubmissionOnly !== undefined ? initialSingleSubmissionOnly : true
  );
  const [emailInput, setEmailInput] = useState('');
  const [fields, setFields] = useState<FormField[]>(() => {
    if (initialFields && initialFields.length > 0) {
      return initialFields.map((f, i) => ({
        ...f,
        id: f.id || crypto.randomUUID(),
        sortOrder: i
      }));
    }
    return [
      {
        id: crypto.randomUUID(),
        label: 'Full Name',
        fieldType: 'text',
        placeholder: 'Enter your full name',
        isRequired: true,
        sortOrder: 0
      },
      {
        id: crypto.randomUUID(),
        label: 'Email Address',
        fieldType: 'email',
        placeholder: 'your.name@example.com',
        isRequired: true,
        sortOrder: 1
      },
      {
        id: crypto.randomUUID(),
        label: 'Preferred Date',
        fieldType: 'date',
        helpText: 'Select your preferred appointment date',
        isRequired: false,
        sortOrder: 2
      }
    ];
  });

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(fields[0]?.id || null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [draggedTemplate, setDraggedTemplate] = useState<FieldTemplate | null>(null);
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);

  const addEmailTag = (emailStr?: string) => {
    const target = emailStr || emailInput;
    if (!target) return;
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
      sortOrder: fields.length
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

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  const updateSelectedField = (updates: Partial<FormField>) => {
    if (!selectedFieldId) return;
    setFields(
      fields.map((f) => (f.id === selectedFieldId ? { ...f, ...updates } : f))
    );
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
      config: field.config ? { ...field.config } : undefined
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

  const handleTemplateDragStart = (template: FieldTemplate) => {
    setDraggedTemplate(template);
    setDraggedFieldIndex(null);
  };

  const handleCanvasDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: DragEvent<HTMLElement>, dropIndex?: number) => {
    e.preventDefault();
    if (draggedTemplate) {
      addFieldFromTemplate(draggedTemplate, dropIndex);
      setDraggedTemplate(null);
    } else if (draggedFieldIndex !== null && dropIndex !== undefined) {
      const updated = [...fields];
      const [moved] = updated.splice(draggedFieldIndex, 1);
      updated.splice(dropIndex, 0, moved);
      setFields(updated.map((f, i) => ({ ...f, sortOrder: i })));
      setDraggedFieldIndex(null);
    }
  };

  const handlePublish = async () => {
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
      setError(`Please add at least one email address for ${accessType === 'allow_only' ? 'allowing' : 'restricting'} submissions.`);
      return;
    }

    setError('');
    setPublishing(true);

    try {
      const endpoint = formId ? `${apiUrl}/api/forms/${formId}` : `${apiUrl}/api/forms`;
      const method = formId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
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
            config: f.config
          }))
        })
      });

      const data = (await response.json()) as {
        form?: { shareId?: string; id?: string };
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save form.');
      }

      onFormCreated(data.form?.shareId || formId || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish form.');
    } finally {
      setPublishing(false);
    }
  };

  const filteredTemplates = FIELD_TEMPLATES.filter((t) => {
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="form-builder-container">
      {/* Top Header Toolbar */}
      <header className="builder-header">
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button3D variant="ghost" size="sm" icon={<Icon name="arrow-left" size={14} />} onClick={onBack}>
            Back
          </Button3D>
          <span className="builder-title-badge">
            Studio
          </span>
        </div>

        <div className="header-center">
          <div className="mode-toggle">
            <button
              type="button"
              className={`toggle-btn ${!isPreview ? 'active' : ''}`}
              onClick={() => setIsPreview(false)}
            >
              <Icon name="edit" size={14} /> Edit Studio
            </button>
            <button
              type="button"
              className={`toggle-btn ${isPreview ? 'active' : ''}`}
              onClick={() => setIsPreview(true)}
            >
              <Icon name="eye" size={14} /> Live Preview
            </button>
          </div>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className={`btn ${accessType !== 'allow_all' || singleSubmissionOnly ? 'btn-3d-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setShowAccessModal(true)}
            title="Configure submission access permissions and limits"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Icon name="lock" size={14} />
            <span>Access & Limits</span>
            {(accessType !== 'allow_all' || singleSubmissionOnly) && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
            )}
          </button>
          <ThemeToggle size="sm" />
          <Button3D
            variant="primary"
            size="md"
            icon={<Icon name="zap" size={14} />}
            onClick={handlePublish}
            loading={publishing}
          >
            Publish Form
          </Button3D>
        </div>
      </header>

      {error && <div className="builder-alert error">{error}</div>}

      <div className="builder-body">
        {/* LEFT SIDEBAR: FIELD TEMPLATES PALETTE */}
        {!isPreview && (
          <aside className="sidebar-palette">
            <div className="sidebar-header">
              <h3>Field Elements</h3>
              <p>Drag or click any field to add to canvas.</p>
            </div>

            <div className="sidebar-search">
              <input
                type="search"
                placeholder="Search fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="category-chips">
              {[
                { id: 'all', label: 'All' },
                { id: 'text', label: 'Text' },
                { id: 'choice', label: 'Choices' },
                { id: 'datetime', label: 'Date/Time' },
                { id: 'special', label: 'Special' }
              ].map((c) => (
                <button
                  key={c.id}
                  className={`chip ${categoryFilter === c.id ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="templates-list">
              {filteredTemplates.map((template) => (
                <div
                  key={template.type}
                  className="template-card"
                  draggable
                  onDragStart={() => handleTemplateDragStart(template)}
                  onClick={() => addFieldFromTemplate(template)}
                  title="Click or drag into form canvas"
                >
                  <div className="template-icon-box">
                    <Icon name={template.icon} size={18} />
                  </div>
                  <div className="template-info">
                    <span className="template-name">{template.name}</span>
                    <span className="template-desc">{template.description}</span>
                  </div>
                  <span className="add-badge">+ Add</span>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* MAIN FORM CANVAS */}
        <main
          className={`form-canvas-container ${isPreview ? 'preview-mode' : ''}`}
          onDragOver={handleCanvasDragOver}
          onDrop={(e) => handleCanvasDrop(e)}
        >
          <div className="form-canvas">
            {/* Header Card */}
            <div className="form-card header-card">
              {!isPreview ? (
                <>
                  <input
                    type="text"
                    className="title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Form Title"
                  />
                  <textarea
                    className="description-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Form Description (Optional)"
                    rows={2}
                  />

                  {/* Access Summary Bar (Clickable outside form helper) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      type="button"
                      className="access-status-chip"
                      onClick={() => setShowAccessModal(true)}
                      title="Click to configure who can submit and limit rules"
                    >
                      <Icon name="lock" size={13} />
                      <span>
                        {accessType === 'allow_all'
                          ? 'Public Form (All Users)'
                          : accessType === 'allow_only'
                            ? `Whitelist (${restrictedEmails.length} allowed)`
                            : `Blacklist (${restrictedEmails.length} restricted)`}
                        {singleSubmissionOnly ? ' • Single Submission' : ''}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 600, marginLeft: '4px' }}>
                        Configure ⚙
                      </span>
                    </button>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>* Required field indicator</span>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="preview-title">{title}</h1>
                  {description && <p className="preview-description">{description}</p>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                    {accessType !== 'allow_all' && (
                      <div className="preview-access-badge">
                        <Icon name="lock" size={14} />
                        <span>
                          {accessType === 'allow_only'
                            ? `Access Restricted: Only ${restrictedEmails.length} authorized user email(s) can submit`
                            : `Access Restricted: ${restrictedEmails.length} user email(s) restricted`}
                        </span>
                      </div>
                    )}
                    {singleSubmissionOnly && (
                      <div className="preview-access-badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-primary)', borderColor: 'var(--accent-border)' }}>
                        <Icon name="check" size={14} />
                        <span>Single Submission Only: 1 response per user limit active</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Field Items on Canvas */}
            {fields.length === 0 ? (
              <div
                className="empty-canvas-dropzone"
                onDragOver={handleCanvasDragOver}
                onDrop={(e) => handleCanvasDrop(e, 0)}
              >
                <div className="dropzone-icon">
                  <Icon name="plus" size={40} />
                </div>
                <h3>Your form canvas is empty</h3>
                <p>Drag elements here from the left sidebar or click any field to begin.</p>
              </div>
            ) : (
              fields.map((field, index) => {
                const isSelected = selectedFieldId === field.id && !isPreview;
                return (
                  <div
                    key={field.id}
                    className={`form-card field-card ${isSelected ? 'selected' : ''}`}
                    draggable={!isPreview}
                    onDragStart={() => setDraggedFieldIndex(index)}
                    onDragOver={handleCanvasDragOver}
                    onDrop={(e) => handleCanvasDrop(e, index)}
                    onClick={() => !isPreview && setSelectedFieldId(field.id)}
                  >
                    {!isPreview && (
                      <div className="field-card-toolbar">
                        <span className="drag-handle" title="Drag to reorder">
                          <Icon name="drag" size={14} /> #{index + 1}
                        </span>
                        <div className="field-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            disabled={index === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveField(index, 'up');
                            }}
                            title="Move Up"
                          >
                            <Icon name="arrow-up" size={14} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            disabled={index === fields.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveField(index, 'down');
                            }}
                            title="Move Down"
                          >
                            <Icon name="arrow-down" size={14} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateField(field);
                            }}
                            title="Duplicate Field"
                          >
                            <Icon name="copy" size={14} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeField(field.id);
                            }}
                            title="Delete Field"
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="field-preview-area">
                      <label className="field-label">
                        {field.label}
                        {field.isRequired && <span className="required-star"> *</span>}
                      </label>

                      {field.helpText && (
                        <div className="field-help-text">{field.helpText}</div>
                      )}

                      <RenderFieldInput field={field} disabled={!isPreview} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR: FIELD PROPERTIES INSPECTOR */}
        {!isPreview && selectedField && (
          <aside className="sidebar-properties">
            <div className="properties-header">
              <div>
                <h3>
                  <Icon name="settings" size={16} /> Field Settings
                </h3>
                <p>Configure question details and validation.</p>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSelectedFieldId(null)}
                title="Close settings"
                style={{ width: '28px', height: '28px' }}
              >
                <Icon name="x" size={15} />
              </button>
            </div>

            <div className="properties-form">
              {/* 1. Field Label */}
              <div className="property-group">
                <label className="property-label">Field Label</label>
                <input
                  type="text"
                  className="property-input"
                  value={selectedField.label}
                  onChange={(e) => updateSelectedField({ label: e.target.value })}
                  placeholder="e.g. Full Name"
                />
              </div>

              {/* 2. Input Type */}
              <div className="property-group">
                <label className="property-label">Input Type</label>
                <select
                  className="property-select"
                  value={selectedField.fieldType}
                  onChange={(e) =>
                    updateSelectedField({ fieldType: e.target.value as FieldType })
                  }
                >
                  {FIELD_TEMPLATES.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Required Field Toggle Card */}
              <div className="property-toggle-card">
                <div>
                  <span className="toggle-card-title">Required Field</span>
                  <span className="toggle-card-desc">Must be answered before submit</span>
                </div>
                <div className="toggle-switch-wrapper">
                  <input
                    type="checkbox"
                    checked={selectedField.isRequired}
                    onChange={(e) =>
                      updateSelectedField({ isRequired: e.target.checked })
                    }
                  />
                  <span className="toggle-slider"></span>
                </div>
              </div>

              {/* 4. Placeholder Text */}
              {['text', 'textarea', 'password', 'email', 'number', 'tel', 'url', 'search'].includes(
                selectedField.fieldType
              ) && (
                <div className="property-group">
                  <label className="property-label">Placeholder Text</label>
                  <input
                    type="text"
                    className="property-input"
                    value={selectedField.placeholder || ''}
                    onChange={(e) => updateSelectedField({ placeholder: e.target.value })}
                    placeholder="e.g. Type your answer here..."
                  />
                </div>
              )}

              {/* 5. Help Text / Subtitle */}
              <div className="property-group">
                <label className="property-label">Help Text / Subtitle</label>
                <input
                  type="text"
                  className="property-input"
                  value={selectedField.helpText || ''}
                  onChange={(e) => updateSelectedField({ helpText: e.target.value })}
                  placeholder="e.g. Please enter a valid email"
                />
              </div>

              {/* 6. Options Editor (Radio, Checkbox, Select) */}
              {['radio', 'checkbox', 'select'].includes(selectedField.fieldType) && (
                <div className="property-group">
                  <label className="property-label">Choices / Options</label>
                  <div className="options-editor">
                    {(selectedField.options || []).map((opt, i) => (
                      <div key={i} className="option-row">
                        <span className="option-index-badge">{i + 1}</span>
                        <input
                          type="text"
                          className="property-input"
                          value={opt}
                          onChange={(e) => {
                            const nextOpts = [...(selectedField.options || [])];
                            nextOpts[i] = e.target.value;
                            updateSelectedField({ options: nextOpts });
                          }}
                        />
                        <button
                          type="button"
                          className="icon-btn delete-btn"
                          onClick={() => {
                            const nextOpts = (selectedField.options || []).filter(
                              (_, idx) => idx !== i
                            );
                            updateSelectedField({ options: nextOpts });
                          }}
                          title="Delete option"
                          style={{ width: '32px', height: '32px', flexShrink: 0 }}
                        >
                          <Icon name="x" size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
                      onClick={() => {
                        const nextOpts = [
                          ...(selectedField.options || []),
                          `Option ${(selectedField.options?.length || 0) + 1}`
                        ];
                        updateSelectedField({ options: nextOpts });
                      }}
                    >
                      <Icon name="plus" size={13} /> Add Choice Option
                    </button>
                  </div>
                </div>
              )}

              {/* 7. Range / Number Min/Max Configuration */}
              {['number', 'range'].includes(selectedField.fieldType) && (
                <div className="property-group">
                  <label className="property-label">Numeric Bounds</label>
                  <div className="range-config-grid">
                    <div className="property-group">
                      <label className="property-label" style={{ fontSize: '10px' }}>Min</label>
                      <input
                        type="number"
                        className="property-input"
                        value={selectedField.config?.min ?? 0}
                        onChange={(e) =>
                          updateSelectedField({
                            config: { ...selectedField.config, min: Number(e.target.value) }
                          })
                        }
                      />
                    </div>
                    <div className="property-group">
                      <label className="property-label" style={{ fontSize: '10px' }}>Max</label>
                      <input
                        type="number"
                        className="property-input"
                        value={selectedField.config?.max ?? 100}
                        onChange={(e) =>
                          updateSelectedField({
                            config: { ...selectedField.config, max: Number(e.target.value) }
                          })
                        }
                      />
                    </div>
                    {selectedField.fieldType === 'range' && (
                      <div className="property-group">
                        <label className="property-label" style={{ fontSize: '10px' }}>Step</label>
                        <input
                          type="number"
                          className="property-input"
                          value={selectedField.config?.step ?? 1}
                          onChange={(e) =>
                            updateSelectedField({
                              config: { ...selectedField.config, step: Number(e.target.value) }
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 8. Delete Field Action */}
              <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-default)' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', color: 'var(--destructive)', justifyContent: 'center' }}
                  onClick={() => removeField(selectedField.id)}
                >
                  <Icon name="trash" size={14} /> Delete This Field
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* SUBMISSION ACCESS RESTRICTIONS MODAL DIALOG */}
      {showAccessModal && (
        <div className="modal-backdrop" onClick={() => setShowAccessModal(false)}>
          <div
            className="card modal-card detail-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px' }}
          >
            <div className="detail-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'var(--accent-subtle)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon name="lock" size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 700 }}>
                    Submission Access & Security
                  </h3>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    Control who is authorized to submit and response limits.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowAccessModal(false)}
                title="Close"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="detail-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Access Mode Selector */}
              <div>
                <label className="property-label" style={{ marginBottom: '8px' }}>Access Permission Rules</label>
                <div className="access-options-grid">
                  <label className={`access-radio-card ${accessType === 'allow_all' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="accessType"
                      value="allow_all"
                      checked={accessType === 'allow_all'}
                      onChange={() => setAccessType('allow_all')}
                    />
                    <div>
                      <strong>Allow All Users</strong>
                      <span className="radio-desc">Open access: any valid email ID can submit.</span>
                    </div>
                  </label>

                  <label className={`access-radio-card ${accessType === 'allow_only' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="accessType"
                      value="allow_only"
                      checked={accessType === 'allow_only'}
                      onChange={() => setAccessType('allow_only')}
                    />
                    <div>
                      <strong>Allow Specific Users (Whitelist)</strong>
                      <span className="radio-desc">Only specified email IDs are permitted.</span>
                    </div>
                  </label>

                  <label className={`access-radio-card ${accessType === 'restrict_specific' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="accessType"
                      value="restrict_specific"
                      checked={accessType === 'restrict_specific'}
                      onChange={() => setAccessType('restrict_specific')}
                    />
                    <div>
                      <strong>Restrict Specific Users (Blacklist)</strong>
                      <span className="radio-desc">Block specific email IDs from submitting.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Whitelist / Blacklist Email Tag Input */}
              {accessType !== 'allow_all' && (
                <div className="email-restriction-input-area" style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                  <label className="input-sublabel" style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', display: 'block', marginBottom: '8px' }}>
                    {accessType === 'allow_only'
                      ? 'Specify email IDs allowed to submit:'
                      : 'Specify email IDs restricted from submitting:'}
                  </label>

                  <div className="email-tag-input-row" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                      type="email"
                      className="property-input"
                      placeholder="e.g. user@example.com (Press Enter or Click Add)"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addEmailTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-3d-primary btn-sm"
                      onClick={() => addEmailTag()}
                      style={{ flexShrink: 0 }}
                    >
                      + Add Email
                    </button>
                  </div>

                  {restrictedEmails.length > 0 && (
                    <div className="email-tags-wrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {restrictedEmails.map((email) => (
                        <span key={email} className="email-tag-chip">
                          {email}
                          <button
                            type="button"
                            className="remove-email-btn"
                            onClick={() => removeEmailTag(email)}
                            title="Remove email"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center' }}
                          >
                            <Icon name="x" size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="access-info-note" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {accessType === 'allow_only'
                      ? `Only ${restrictedEmails.length} specified email address(es) will be allowed.`
                      : `${restrictedEmails.length} specified email address(es) will be blocked.`}
                  </div>
                </div>
              )}

              {/* Single Submission Limit Toggle Card */}
              <div>
                <label className="property-label" style={{ marginBottom: '8px' }}>Submission Limit</label>
                <div
                  className="single-submission-setting-card"
                  style={{
                    padding: '14px 16px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      cursor: 'pointer',
                      margin: 0
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <Icon name="check" size={15} style={{ color: 'var(--accent-primary)' }} />
                        <span>Limit to 1 response per user</span>
                      </div>
                      <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                        Each respondent can only fill out and submit this form once. Email address is verified upon submission to prevent duplicate responses.
                      </span>
                    </div>
                    <div className="toggle-switch-wrapper" style={{ flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={singleSubmissionOnly}
                        onChange={(e) => setSingleSubmissionOnly(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="detail-modal-footer">
              <Button3D
                variant="primary"
                size="md"
                onClick={() => setShowAccessModal(false)}
              >
                Save & Close
              </Button3D>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RenderFieldInput({
  field,
  disabled,
  value,
  onChange
}: {
  field: FormField;
  disabled?: boolean;
  value?: any;
  onChange?: (val: any) => void;
}) {
  switch (field.fieldType) {
    case 'textarea':
      return (
        <textarea
          placeholder={field.placeholder || 'Enter response...'}
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          rows={3}
          required={field.isRequired}
        />
      );

    case 'password':
      return (
        <input
          type="password"
          placeholder={field.placeholder || '••••••••'}
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          required={field.isRequired}
        />
      );

    case 'email':
      return (
        <input
          type="email"
          placeholder={field.placeholder || 'name@domain.com'}
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          required={field.isRequired}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          placeholder={field.placeholder || '0'}
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          min={field.config?.min}
          max={field.config?.max}
          required={field.isRequired}
        />
      );

    case 'tel':
      return (
        <input
          type="tel"
          placeholder={field.placeholder || '+1 (555) 000-0000'}
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          required={field.isRequired}
        />
      );

    case 'url':
      return (
        <input
          type="url"
          placeholder={field.placeholder || 'https://example.com'}
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          required={field.isRequired}
        />
      );

    case 'search':
      return (
        <input
          type="search"
          placeholder={field.placeholder || 'Search query...'}
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          required={field.isRequired}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          required={field.isRequired}
        />
      );

    case 'time':
      return (
        <input
          type="time"
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          required={field.isRequired}
        />
      );

    case 'datetime-local':
      return (
        <input
          type="datetime-local"
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          required={field.isRequired}
        />
      );

    case 'color':
      return (
        <div className="color-picker-wrapper">
          <input
            type="color"
            disabled={disabled}
            value={value || '#0d9488'}
            onChange={(e) => onChange?.(e.target.value)}
          />
          <span className="color-val">{value || '#0d9488'}</span>
        </div>
      );

    case 'radio':
      return (
        <div className="radio-group">
          {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
            <label key={i} className="radio-option">
              <input
                type="radio"
                name={`radio-${field.id}`}
                disabled={disabled}
                checked={value === opt}
                onChange={() => onChange?.(opt)}
                required={field.isRequired}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      );

    case 'checkbox':
      const currentSelected: string[] = Array.isArray(value) ? value : [];
      return (
        <div className="checkbox-group">
          {(field.options || ['Option A', 'Option B']).map((opt, i) => {
            const checked = currentSelected.includes(opt);
            return (
              <label key={i} className="checkbox-option">
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange?.([...currentSelected, opt]);
                    } else {
                      onChange?.(currentSelected.filter((v) => v !== opt));
                    }
                  }}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      );

    case 'select':
      return (
        <select
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          required={field.isRequired}
        >
          <option value="">-- Choose Option --</option>
          {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case 'toggle':
      return (
        <label className="toggle-switch-wrapper">
          <input
            type="checkbox"
            disabled={disabled}
            checked={Boolean(value)}
            onChange={(e) => onChange?.(e.target.checked)}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-label-text">{value ? 'Enabled' : 'Disabled'}</span>
        </label>
      );

    case 'range':
      const min = field.config?.min ?? 0;
      const max = field.config?.max ?? 100;
      const step = field.config?.step ?? 1;
      const currentVal = value !== undefined ? value : Math.round((min + max) / 2);
      return (
        <div className="range-slider-wrapper">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            value={currentVal}
            onChange={(e) => onChange?.(Number(e.target.value))}
          />
          <div className="range-meta">
            <span>Min: {min}</span>
            <span className="current-range-val">Value: {currentVal}</span>
            <span>Max: {max}</span>
          </div>
        </div>
      );

    case 'text':
    default:
      return (
        <input
          type="text"
          placeholder={field.placeholder || 'Type your answer here...'}
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          required={field.isRequired}
        />
      );
  }
}
