import { Icon } from '../../Icons';
import { FormField } from '../../types';
import { FieldRenderer } from '../fields/FieldRenderer';

interface FieldCardProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  isPreview: boolean;
  totalFields: number;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent<HTMLElement>) => void;
  onDrop: (e: React.DragEvent<HTMLElement>) => void;
}

/**
 * Individual field card on the form canvas.
 * Displays field label, help text, preview input, and a toolbar for editing.
 */
export function FieldCard({
  field,
  index,
  isSelected,
  isPreview,
  totalFields,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}: FieldCardProps) {
  return (
    <div
      className={`form-card field-card ${isSelected ? 'selected' : ''}`}
      draggable={!isPreview}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => !isPreview && onSelect()}
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
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              title="Move Up"
            >
              <Icon name="arrow-up" size={14} />
            </button>
            <button
              type="button"
              className="icon-btn"
              disabled={index === totalFields - 1}
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              title="Move Down"
            >
              <Icon name="arrow-down" size={14} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              title="Duplicate Field"
            >
              <Icon name="copy" size={14} />
            </button>
            <button
              type="button"
              className="icon-btn delete-btn"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
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

        <FieldRenderer field={field} disabled={!isPreview} />
      </div>
    </div>
  );
}
