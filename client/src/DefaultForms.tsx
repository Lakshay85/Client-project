import { useState } from 'react';
import { DEFAULT_FORM_TEMPLATES, DefaultFormTemplate } from './defaultFormsData';
import { Icon } from './Icons';
import { TemplateCard } from './components/TemplateCard';
import { FieldRenderer } from './components/fields/FieldRenderer';

interface DefaultFormsProps {
  onBack: () => void;
  onUseTemplate: (template: DefaultFormTemplate) => void;
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
    <div className="default-forms-page">
      {/* 1. Consistent Hero Header Banner */}
      <header className="dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="form-card-icon-box" style={{ width: '44px', height: '44px', flexShrink: 0 }}>
            <Icon name="textarea" size={22} />
          </div>
          <div>
            <h1>
              Form Blueprints &amp; <span style={{ color: 'var(--accent-primary)' }}>Templates</span>
            </h1>
            <p>
              Select from our curated form blueprints designed with structural precision. Customize fields, configure email gatekeeping, and start collecting telemetry instantly.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="count-badge">
            {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
          </span>
        </div>
      </header>

      {/* 2. Controls Bar: Search & Category Filter Pills */}
      <div className="card responses-controls-bar">
        <div className="search-input-wrapper">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Search blueprints by name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <Icon name="x" size={14} />
            </button>
          )}
        </div>

        <div className="status-filter-pills">
          {categories.map((cat) => {
            const isSelected = categoryFilter.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                className={`filter-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Multi-Column Grid */}
      <div className="forms-grid">
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
              overflow: 'hidden',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-surface)'
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
                    borderRadius: 'var(--radius-xs)',
                    background: previewTemplate.iconBg || 'var(--accent-subtle)',
                    color: previewTemplate.iconColor || 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px dashed var(--accent-border)'
                  }}
                >
                  <Icon name={previewTemplate.icon} size={18} />
                </div>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <span className="live-dot" /> Preview Mode
                  </div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{previewTemplate.title}</h2>
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
                  borderRadius: 'var(--radius-xs)',
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
                  <div className="empty-icon-box" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-xs)', border: '1px dashed var(--success-border)', background: 'var(--success-subtle)', color: 'var(--success)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={24} />
                  </div>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '8px' }}>Sample Response Submitted!</h3>
                  <p style={{ maxWidth: '400px', margin: '0 auto 20px', fontSize: 'var(--font-size-sm)' }}>
                    This is a live preview test. Your respondents will fill out and submit this exact form.
                  </p>
                  <button
                    type="button"
                    className="fe-btn fe-btn-primary"
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
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      <span>* Indicates required field</span> • <span>{previewTemplate.fields.length} Input Fields</span>
                    </div>
                  </div>

                  <div className="preview-fields-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {previewTemplate.fields.map((field) => (
                      <div key={field.id} className="card" style={{ padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
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
                          <FieldRenderer
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
                    <button type="submit" className="fe-btn fe-btn-primary">
                      Submit Response (Preview Test)
                    </button>
                    <button
                      type="button"
                      className="fe-btn fe-btn-ghost"
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
                className="fe-btn fe-btn-ghost"
                onClick={() => setPreviewTemplate(null)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="fe-btn fe-btn-primary"
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
