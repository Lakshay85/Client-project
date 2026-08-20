import { Icon } from '../../Icons';
import { FormField, FieldType } from '../../types';
import { FIELD_TEMPLATES } from '../../fieldTemplates';

interface FieldPropertiesPanelProps {
  selectedField: FormField;
  onUpdateField: (updates: Partial<FormField>) => void;
  onRemoveField: (id: string) => void;
  onClose: () => void;
}

/**
 * Right sidebar properties inspector for the selected field.
 * Allows editing label, type, required, placeholder, help text, options, and numeric bounds.
 */
export function FieldPropertiesPanel({
  selectedField,
  onUpdateField,
  onRemoveField,
  onClose,
}: FieldPropertiesPanelProps) {
  return (
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
          onClick={onClose}
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
            onChange={(e) => onUpdateField({ label: e.target.value })}
            placeholder="e.g. Full Name"
          />
        </div>

        {/* 2. Input Type */}
        <div className="property-group">
          <label className="property-label">Input Type</label>
          <select
            className="property-select"
            value={selectedField.fieldType}
            onChange={(e) => onUpdateField({ fieldType: e.target.value as FieldType })}
          >
            {FIELD_TEMPLATES.map((t) => (
              <option key={t.type} value={t.type}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Required Field Toggle */}
        <div className="property-toggle-card">
          <div>
            <span className="toggle-card-title">Required Field</span>
            <span className="toggle-card-desc">Must be answered before submit</span>
          </div>
          <div className="toggle-switch-wrapper">
            <input
              type="checkbox"
              checked={selectedField.isRequired}
              onChange={(e) => onUpdateField({ isRequired: e.target.checked })}
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
              onChange={(e) => onUpdateField({ placeholder: e.target.value })}
              placeholder="e.g. Type your answer here..."
            />
          </div>
        )}

        {/* 5. Help Text */}
        <div className="property-group">
          <label className="property-label">Help Text / Subtitle</label>
          <input
            type="text"
            className="property-input"
            value={selectedField.helpText || ''}
            onChange={(e) => onUpdateField({ helpText: e.target.value })}
            placeholder="e.g. Please enter a valid email"
          />
        </div>

        {/* 6. Options Editor */}
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
                      onUpdateField({ options: nextOpts });
                    }}
                  />
                  <button
                    type="button"
                    className="icon-btn delete-btn"
                    onClick={() => {
                      const nextOpts = (selectedField.options || []).filter((_, idx) => idx !== i);
                      onUpdateField({ options: nextOpts });
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
                    `Option ${(selectedField.options?.length || 0) + 1}`,
                  ];
                  onUpdateField({ options: nextOpts });
                }}
              >
                <Icon name="plus" size={13} /> Add Choice Option
              </button>
            </div>
          </div>
        )}

        {/* 7. Range / Number Config */}
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
                    onUpdateField({ config: { ...selectedField.config, min: Number(e.target.value) } })
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
                    onUpdateField({ config: { ...selectedField.config, max: Number(e.target.value) } })
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
                      onUpdateField({ config: { ...selectedField.config, step: Number(e.target.value) } })
                    }
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. Delete Field */}
        <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-default)' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', color: 'var(--destructive)', justifyContent: 'center' }}
            onClick={() => onRemoveField(selectedField.id)}
          >
            <Icon name="trash" size={14} /> Delete This Field
          </button>
        </div>
      </div>
    </aside>
  );
}
