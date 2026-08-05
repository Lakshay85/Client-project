import { useState, DragEvent } from 'react';
import { FIELD_TEMPLATES } from './fieldTemplates';
import { Icon } from './Icons';
import { FieldTemplate, FormField, FieldType } from './types';

interface FormBuilderProps {
  token: string;
  apiUrl: string;
  onBack: () => void;
  onFormCreated: (shareId: string) => void;
  initialTitle?: string;
  initialDescription?: string;
  initialFields?: FormField[];
}

export function FormBuilder({
  token,
  apiUrl,
  onBack,
  onFormCreated,
  initialTitle,
  initialDescription,
  initialFields
}: FormBuilderProps) {
  const [title, setTitle] = useState(initialTitle || 'Untitled Form');
  const [description, setDescription] = useState(
    initialDescription ?? 'Please fill out this form to submit your details.'
  );
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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [draggedTemplate, setDraggedTemplate] = useState<FieldTemplate | null>(null);
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);

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

    setError('');
    setPublishing(true);

    try {
      const response = await fetch(`${apiUrl}/api/forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          fields: fields.map((f) => ({
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
        form?: { shareId: string };
        message?: string;
      };

      if (!response.ok || !data.form?.shareId) {
        throw new Error(data.message || 'Failed to create form.');
      }

      onFormCreated(data.form.shareId);
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
        <div className="header-left">
          <button className="text-button back-btn" onClick={onBack}>
            ← Dashboard
          </button>
          <div className="builder-title-badge">Form Builder Studio</div>
        </div>

        <div className="header-center">
          <div className="mode-toggle">
            <button
              className={`toggle-btn ${!isPreview ? 'active' : ''}`}
              onClick={() => setIsPreview(false)}
            >
              🛠️ Edit Mode
            </button>
            <button
              className={`toggle-btn ${isPreview ? 'active' : ''}`}
              onClick={() => setIsPreview(true)}
            >
              <Icon name="eye" size={15} /> Live Preview
            </button>
          </div>
        </div>

        <div className="header-right">
          <button
            className="coral-button publish-btn"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? 'Publishing...' : 'Publish & Share Form'}
          </button>
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
                </>
              ) : (
                <>
                  <h1 className="preview-title">{title}</h1>
                  {description && <p className="preview-description">{description}</p>}
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
                            ▲
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
                            ▼
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
            <div className="sidebar-header">
              <h3>Field Settings</h3>
              <p>Configure label and validation rules.</p>
            </div>

            <div className="properties-form">
              <label>
                Field Label
                <input
                  type="text"
                  value={selectedField.label}
                  onChange={(e) => updateSelectedField({ label: e.target.value })}
                />
              </label>

              <label>
                Input Type
                <select
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
              </label>

              <div className="toggle-property">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedField.isRequired}
                    onChange={(e) =>
                      updateSelectedField({ isRequired: e.target.checked })
                    }
                  />
                  <span>Required Field</span>
                </label>
              </div>

              {['text', 'textarea', 'password', 'email', 'number', 'tel', 'url', 'search'].includes(
                selectedField.fieldType
              ) && (
                <label>
                  Placeholder Text
                  <input
                    type="text"
                    value={selectedField.placeholder || ''}
                    onChange={(e) => updateSelectedField({ placeholder: e.target.value })}
                  />
                </label>
              )}

              <label>
                Help Text / Subtitle
                <input
                  type="text"
                  value={selectedField.helpText || ''}
                  onChange={(e) => updateSelectedField({ helpText: e.target.value })}
                  placeholder="e.g. Please enter a valid email"
                />
              </label>

              {['radio', 'checkbox', 'select'].includes(selectedField.fieldType) && (
                <div className="options-editor">
                  <label>Choices / Options</label>
                  {(selectedField.options || []).map((opt, i) => (
                    <div key={i} className="option-row">
                      <input
                        type="text"
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
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="text-button add-opt-btn"
                    onClick={() => {
                      const nextOpts = [
                        ...(selectedField.options || []),
                        `Option ${(selectedField.options?.length || 0) + 1}`
                      ];
                      updateSelectedField({ options: nextOpts });
                    }}
                  >
                    + Add Choice Option
                  </button>
                </div>
              )}

              {['number', 'range'].includes(selectedField.fieldType) && (
                <div className="range-config-grid">
                  <label>
                    Min
                    <input
                      type="number"
                      value={selectedField.config?.min ?? 0}
                      onChange={(e) =>
                        updateSelectedField({
                          config: { ...selectedField.config, min: Number(e.target.value) }
                        })
                      }
                    />
                  </label>
                  <label>
                    Max
                    <input
                      type="number"
                      value={selectedField.config?.max ?? 100}
                      onChange={(e) =>
                        updateSelectedField({
                          config: { ...selectedField.config, max: Number(e.target.value) }
                        })
                      }
                    />
                  </label>
                  {selectedField.fieldType === 'range' && (
                    <label>
                      Step
                      <input
                        type="number"
                        value={selectedField.config?.step ?? 1}
                        onChange={(e) =>
                          updateSelectedField({
                            config: { ...selectedField.config, step: Number(e.target.value) }
                          })
                        }
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
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

    case 'file':
      return (
        <div className="file-input-wrapper">
          <input
            type="file"
            disabled={disabled}
            onChange={(e) => {
              const fileName = e.target.files?.[0]?.name || '';
              onChange?.(fileName ? `Uploaded: ${fileName}` : '');
            }}
          />
          {value && <div className="uploaded-file-name">📄 {value}</div>}
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
