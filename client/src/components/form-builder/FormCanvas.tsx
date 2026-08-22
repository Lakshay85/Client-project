import { DragEvent } from 'react';
import { Icon } from '../../Icons';
import { FormField } from '../../types';
import { FieldCard } from './FieldCard';

interface FormCanvasProps {
  fields: FormField[];
  selectedFieldId: string | null;
  isPreview: boolean;
  title: string;
  description: string;
  accessType: string;
  restrictedEmails: string[];
  singleSubmissionOnly: boolean;
  onSetTitle: (v: string) => void;
  onSetDescription: (v: string) => void;
  onSelectField: (id: string) => void;
  onMoveField: (index: number, direction: 'up' | 'down') => void;
  onDuplicateField: (field: FormField) => void;
  onRemoveField: (id: string) => void;
  onShowAccessModal: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: DragEvent<HTMLElement>) => void;
  onDrop: (e: DragEvent<HTMLElement>, dropIndex?: number) => void;
  onOpenPalette?: () => void;
}

/**
 * Main form canvas area showing the form header and field cards.
 */
export function FormCanvas({
  fields,
  selectedFieldId,
  isPreview,
  title,
  description,
  accessType,
  restrictedEmails,
  singleSubmissionOnly,
  onSetTitle,
  onSetDescription,
  onSelectField,
  onMoveField,
  onDuplicateField,
  onRemoveField,
  onShowAccessModal,
  onDragStart,
  onDragOver,
  onDrop,
  onOpenPalette,
}: FormCanvasProps) {
  return (
    <main
      className={`form-canvas-container ${isPreview ? 'preview-mode' : ''}`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e)}
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
                onChange={(e) => onSetTitle(e.target.value)}
                placeholder="Form Title"
              />
              <textarea
                className="description-input"
                value={description}
                onChange={(e) => onSetDescription(e.target.value)}
                placeholder="Form Description (Optional)"
                rows={2}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className="access-status-chip"
                  onClick={onShowAccessModal}
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

        {/* Field Items */}
        {fields.length === 0 ? (
          <div
            className="empty-canvas-dropzone"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, 0)}
            onClick={() => onOpenPalette && onOpenPalette()}
            style={{ cursor: onOpenPalette ? 'pointer' : 'default' }}
            title="Click to browse and add fields"
          >
            <div className="dropzone-icon">
              <Icon name="plus" size={40} />
            </div>
            <h3>Your form canvas is empty</h3>
            <p>Drag elements here from the palette or tap below to add fields.</p>
            {onOpenPalette && (
              <button
                type="button"
                className="fe-btn fe-btn-primary"
                style={{ marginTop: '14px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPalette();
                }}
              >
                <Icon name="plus" size={15} />
                <span>Browse & Add Fields</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {fields.map((field, index) => (
              <FieldCard
                key={field.id}
                field={field}
                index={index}
                isSelected={selectedFieldId === field.id && !isPreview}
                isPreview={isPreview}
                totalFields={fields.length}
                onSelect={() => onSelectField(field.id)}
                onMoveUp={() => onMoveField(index, 'up')}
                onMoveDown={() => onMoveField(index, 'down')}
                onDuplicate={() => onDuplicateField(field)}
                onRemove={() => onRemoveField(field.id)}
                onDragStart={() => onDragStart(index)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, index)}
              />
            ))}

            {!isPreview && onOpenPalette && (
              <div className="mobile-add-field-row" style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  className="fe-btn fe-btn-ghost"
                  onClick={onOpenPalette}
                  style={{ width: '100%', justifyContent: 'center', border: '1px dashed var(--accent-border)' }}
                >
                  <Icon name="plus" size={15} />
                  <span>+ Add Another Field</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
