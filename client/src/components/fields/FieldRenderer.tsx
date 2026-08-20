import { FormField } from '../../types';

/**
 * Unified field input renderer.
 * Replaces the duplicated RenderFieldInput in FormBuilder.tsx
 * and RenderPreviewFieldInput in DefaultForms.tsx.
 *
 * @pattern Strategy (render strategy selected by field type)
 */
export function FieldRenderer({
  field,
  disabled,
  value,
  onChange,
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

    case 'checkbox': {
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
    }

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

    case 'range': {
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
    }

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

/**
 * Backward-compatible export alias.
 * @deprecated Use FieldRenderer instead.
 */
export const RenderFieldInput = FieldRenderer;
