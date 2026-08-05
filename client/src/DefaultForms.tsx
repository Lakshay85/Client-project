import { useState } from 'react';
import { DEFAULT_FORM_TEMPLATES, DefaultFormTemplate } from './defaultFormsData';
import { FormField } from './types';
import { Icon } from './Icons';

interface DefaultFormsProps {
  onBack: () => void;
  onUseTemplate: (template: DefaultFormTemplate) => void;
}

function RenderPreviewFieldInput({
  field,
  value,
  onChange
}: {
  field: FormField;
  value: any;
  onChange: (val: any) => void;
}) {
  switch (field.fieldType) {
    case 'textarea':
      return (
        <textarea
          rows={3}
          placeholder={field.placeholder || 'Type your response here...'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'select':
      return (
        <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">-- Choose Option --</option>
          {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case 'radio':
      return (
        <div className="radio-group">
          {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
            <label key={i} className="radio-option">
              <input
                type="radio"
                name={`preview-radio-${field.id}`}
                checked={value === opt}
                onChange={() => onChange(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      );

    case 'checkbox':
      const selected: string[] = Array.isArray(value) ? value : [];
      return (
        <div className="checkbox-group">
          {(field.options || ['Option A', 'Option B']).map((opt, i) => {
            const isChecked = selected.includes(opt);
            return (
              <label key={i} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selected, opt]);
                    } else {
                      onChange(selected.filter((v) => v !== opt));
                    }
                  }}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      );

    case 'toggle':
      return (
        <label className="toggle-switch-wrapper">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-label-text">{value ? 'Enabled' : 'Disabled'}</span>
        </label>
      );

    case 'color':
      return (
        <div className="color-picker-wrapper">
          <input
            type="color"
            value={value || '#0d9488'}
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="color-val">{value || '#0d9488'}</span>
        </div>
      );

    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          placeholder={field.placeholder || '0'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    default:
      return (
        <input
          type={field.fieldType === 'email' ? 'email' : field.fieldType === 'tel' ? 'tel' : 'text'}
          placeholder={field.placeholder || 'Type here...'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

export function DefaultForms({ onBack, onUseTemplate }: DefaultFormsProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<DefaultFormTemplate | null>(null);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  const handleOpenPreview = (template: DefaultFormTemplate) => {
    setPreviewTemplate(template);
    setPreviewAnswers({});
    setPreviewSubmitted(false);
  };

  const filteredTemplates = DEFAULT_FORM_TEMPLATES.filter((tpl) => {
    const matchesCategory = categoryFilter === 'all' || tpl.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="default-forms-page">
      {/* Header Toolbar */}
      <header className="default-forms-header">
        <div className="header-left">
          <button className="text-button back-btn" onClick={onBack}>
            ← Dashboard
          </button>
          <div>
            <h1>Pre-Built Default Forms Library</h1>
            <p>Pick any ready-to-use template below to instantly preview, customize & publish your form.</p>
          </div>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="default-forms-controls card">
        <div className="search-box">
          <Icon name="search" size={18} />
          <input
            type="text"
            placeholder="Search default forms by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>

        <div className="category-tabs">
          {['all', 'Feedback', 'Events', 'HR', 'Contact', 'Product'].map((cat) => (
            <button
              key={cat}
              className={`cat-tab ${categoryFilter.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'all' ? 'All Templates' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="default-forms-grid">
        {filteredTemplates.map((template) => (
          <article key={template.id} className="card default-template-card">
            <div className="template-card-header">
              <div className="template-icon-wrapper">
                <Icon name={template.icon} size={24} />
              </div>
              <span className="template-badge">{template.badge}</span>
            </div>

            <h3 className="template-title">{template.title}</h3>
            <p className="template-desc">{template.description}</p>

            <div className="template-fields-summary">
              <span className="summary-title">Form Questions ({template.fields.length}):</span>
              <div className="fields-tag-list">
                {template.fields.map((f) => (
                  <span key={f.id} className="field-type-pill">
                    {f.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="template-card-actions">
              <button
                className="text-button btn-sm"
                onClick={() => handleOpenPreview(template)}
              >
                <Icon name="eye" size={14} /> Preview Form
              </button>
              <button
                className="coral-button btn-sm"
                onClick={() => onUseTemplate(template)}
              >
                <Icon name="plus" size={14} /> Use This Form
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Complete Interactive Live Form Preview Modal */}
      {previewTemplate && (
        <div className="modal-backdrop" onClick={() => setPreviewTemplate(null)}>
          <div
            className="card modal-card template-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-top">
              <div className="modal-icon-badge">
                <Icon name={previewTemplate.icon} size={28} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="live-preview-badge">
                  <span className="live-dot"></span> Live Interactive Form Preview
                </div>
                <h2 style={{ margin: '0 0 4px', fontSize: '22px' }}>{previewTemplate.title}</h2>
                <p className="modal-subtitle">{previewTemplate.description}</p>
              </div>
              <button
                className="clear-search-btn"
                style={{ fontSize: '24px', cursor: 'pointer' }}
                onClick={() => setPreviewTemplate(null)}
              >
                ×
              </button>
            </div>

            {/* Live Form Container */}
            <div className="preview-fields-container">
              {previewSubmitted ? (
                <div className="public-card success-card" style={{ margin: '20px 0' }}>
                  <div className="success-icon">
                    <Icon name="check" size={32} />
                  </div>
                  <h2>Sample Response Submitted!</h2>
                  <p>
                    This is a live preview test. Your respondents will fill out and submit this exact form.
                  </p>
                  <div className="success-actions" style={{ marginTop: '20px' }}>
                    <button
                      className="coral-button"
                      onClick={() => setPreviewSubmitted(false)}
                    >
                      Test Form Again
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  className="preview-live-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setPreviewSubmitted(true);
                  }}
                >
                  <div className="public-card form-header-card" style={{ marginBottom: '16px' }}>
                    <h1 className="public-form-title">{previewTemplate.title}</h1>
                    <p className="public-form-description">{previewTemplate.description}</p>
                    <div className="public-form-meta">
                      <span>* Indicates required field</span> • <span>{previewTemplate.fields.length} Input Fields</span>
                    </div>
                  </div>

                  <div className="preview-fields-list">
                    {previewTemplate.fields.map((field) => (
                      <div key={field.id} className="public-card field-card">
                        <label className="field-label">
                          {field.label}
                          {field.isRequired && <span className="required-star"> *</span>}
                        </label>

                        {field.helpText && (
                          <div className="field-help-text">{field.helpText}</div>
                        )}

                        <div className="field-input-box">
                          <RenderPreviewFieldInput
                            field={field}
                            value={previewAnswers[field.id]}
                            onChange={(val) =>
                              setPreviewAnswers((prev) => ({ ...prev, [field.id]: val }))
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="public-form-footer" style={{ marginTop: '20px' }}>
                    <button type="submit" className="coral-button submit-btn">
                      Submit Response (Preview Test)
                    </button>
                    <button
                      type="button"
                      className="text-button clear-btn"
                      onClick={() => setPreviewAnswers({})}
                    >
                      Clear Answers
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="modal-actions" style={{ marginTop: '16px', flexDirection: 'row', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="text-button"
                onClick={() => setPreviewTemplate(null)}
              >
                Close Preview
              </button>
              <button
                className="coral-button"
                onClick={() => {
                  const tpl = previewTemplate;
                  setPreviewTemplate(null);
                  onUseTemplate(tpl);
                }}
              >
                <Icon name="plus" size={16} /> Load into Form Builder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
