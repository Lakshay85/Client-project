import { useState } from 'react';
import { DEFAULT_FORM_TEMPLATES, DefaultFormTemplate } from './defaultFormsData';
import { FormField } from './types';
import { Icon } from './Icons';
import { TemplateCard } from './components/TemplateCard';

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

    default:
      return (
        <input
          type={field.fieldType || 'text'}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

export function DefaultForms({ onUseTemplate }: DefaultFormsProps) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<DefaultFormTemplate | null>(null);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  const handleOpenPreview = (template: DefaultFormTemplate) => {
    setPreviewTemplate(template);
    setPreviewAnswers({});
    setPreviewSubmitted(false);
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'Feedback', label: 'Feedback' },
    { id: 'Events', label: 'Events' },
    { id: 'HR', label: 'HR & Hiring' },
    { id: 'Contact', label: 'Contact & Support' },
    { id: 'Product', label: 'Product & Reviews' },
    { id: 'Lead Gen', label: 'Lead Capture' },
    { id: 'Surveys', label: 'Surveys & NPS' }
  ];

  const filteredTemplates = DEFAULT_FORM_TEMPLATES.filter((tpl) => {
    const matchesCategory =
      categoryFilter === 'all' || tpl.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="default-forms-page" style={{ width: '100%', margin: 0, padding: 0 }}>
      {/* 1. Big Centered Header Section (Exact layout as reference image) */}
      <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 24px', padding: 0 }}>
        <h1
          style={{
            fontSize: '34px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            margin: '0 0 10px',
            lineHeight: 1.2
          }}
        >
          Every form you need to work with data in one place
        </h1>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: '0 0 24px'
          }}
        >
          Every tool you need to collect data, feedback, and leads, at your fingertips. All are 100% FREE and easy to use! Customize, share, restrict, and analyze responses with just a few clicks.
        </p>

        {/* 2. Centered Pill Filter Buttons */}
        <div className="gallery-pills-row">
          {categories.map((cat) => {
            const isSelected = categoryFilter.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                className={`gallery-filter-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-default)',
                  background: isSelected ? 'var(--text-primary)' : 'var(--bg-surface)',
                  color: isSelected ? 'var(--bg-app)' : 'var(--text-secondary)',
                  boxShadow: isSelected ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Multi-Column Grid (iLovePDF / Tool cards layout) */}
      <div
        className="form-tools-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '16px',
          padding: 0,
          margin: 0
        }}
      >
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onPreview={handleOpenPreview}
            onUseTemplate={onUseTemplate}
          />
        ))}
      </div>

      {/* Interactive Live Form Preview Modal */}
      {previewTemplate && (
        <div className="modal-backdrop" onClick={() => setPreviewTemplate(null)}>
          <div
            className="card modal-card detail-modal-card template-preview-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '680px',
              maxHeight: '85vh',
              height: '85vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden'
            }}
          >
            {/* 1. Fixed Modal Header */}
            <div
              className="detail-modal-header"
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface)',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: previewTemplate.iconBg || 'rgba(99, 102, 241, 0.12)',
                    color: previewTemplate.iconColor || 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon name={previewTemplate.icon} size={18} />
                </div>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <span className="live-dot" /> Preview Mode
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{previewTemplate.title}</h2>
                </div>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setPreviewTemplate(null)}
                title="Close preview"
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  color: 'var(--text-muted)'
                }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* 2. Scrollable Modal Body for Unlimited Fields */}
            <div
              className="detail-modal-body"
              style={{
                padding: '20px 24px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              {previewSubmitted ? (
                <div className="card" style={{ textAlign: 'center', padding: '36px 20px', margin: 'auto 0' }}>
                  <div className="empty-icon-box" style={{ background: 'var(--success-subtle)', color: 'var(--success)', margin: '0 auto 16px' }}>
                    <Icon name="check" size={28} />
                  </div>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '8px' }}>Sample Response Submitted!</h3>
                  <p style={{ maxWidth: '400px', margin: '0 auto 20px', fontSize: 'var(--font-size-sm)' }}>
                    This is a live preview test. Your respondents will fill out and submit this exact form.
                  </p>
                  <button
                    type="button"
                    className="btn btn-3d-primary btn-md"
                    onClick={() => setPreviewSubmitted(false)}
                  >
                    Test Form Again
                  </button>
                </div>
              ) : (
                <form
                  className="preview-live-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setPreviewSubmitted(true);
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 6px', lineHeight: 1.5 }}>
                      {previewTemplate.description}
                    </p>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      <span>* Indicates required field</span> • <span>{previewTemplate.fields.length} Input Fields</span>
                    </div>
                  </div>

                  <div className="preview-fields-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {previewTemplate.fields.map((field) => (
                      <div key={field.id} className="card" style={{ padding: '16px', background: 'var(--bg-surface)' }}>
                        <label className="field-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                          {field.label}
                          {field.isRequired && <span style={{ color: 'var(--destructive)' }}> *</span>}
                        </label>

                        {field.helpText && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            {field.helpText}
                          </div>
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-3d-primary btn-md">
                      Submit Response (Preview Test)
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setPreviewAnswers({})}
                    >
                      Clear Answers
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 3. Fixed Modal Bottom Footer Actions */}
            <div
              className="detail-modal-footer"
              style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                flexShrink: 0
              }}
            >
              <button
                type="button"
                className="btn btn-ghost btn-md"
                onClick={() => setPreviewTemplate(null)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="btn btn-3d-primary btn-md"
                onClick={() => {
                  const tpl = previewTemplate;
                  setPreviewTemplate(null);
                  onUseTemplate(tpl);
                }}
              >
                <Icon name="plus" size={15} /> Load into Form Builder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
