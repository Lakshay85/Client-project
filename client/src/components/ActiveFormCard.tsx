import React from 'react';
import { Form } from '../types';
import { Icon } from '../Icons';

interface ActiveFormCardProps {
  form: Form;
  onCopyLink: (shareId: string) => void;
  onEdit: (form: Form) => void;
  onDelete: (formId: string) => void;
  onViewResponses: (formId: string) => void;
}

export const ActiveFormCard: React.FC<ActiveFormCardProps> = ({
  form,
  onCopyLink,
  onEdit,
  onDelete,
  onViewResponses,
}) => {
  const shareUrl = `${window.location.origin}/?form=${form.shareId}`;
  const restrictedCount = form.restrictedEmails?.length || 0;
  const accessBadgeLabel =
    form.accessType === 'allow_only'
      ? `Whitelisted (${restrictedCount})`
      : form.accessType === 'restrict_specific'
        ? `Blacklisted (${restrictedCount})`
        : `Public`;

  const accessClass =
    form.accessType === 'allow_only'
      ? 'allow_only'
      : form.accessType === 'restrict_specific'
        ? 'restrict_specific'
        : 'allow_all';

  return (
    <div className="card form-summary-card">
      {/* Top Header Row */}
      <div>
        <div className="card-top">
          <div className="form-card-icon-box">
            <Icon name="textarea" size={18} />
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`access-status-badge ${accessClass}`}>
              <Icon
                name={
                  form.accessType === 'allow_only'
                    ? 'lock'
                    : form.accessType === 'restrict_specific'
                      ? 'block'
                      : 'url'
                }
                size={12}
              />
              {accessBadgeLabel}
            </span>

            <span className="form-status-badge">
              {form.status}
            </span>

            <button
              onClick={() => onDelete(form.id)}
              title="Delete Form"
              className="icon-btn delete-btn"
              style={{ padding: '5px 7px' }}
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
        </div>

        {/* Form Title */}
        <h3 className="form-card-title">
          {form.title}
        </h3>

        {/* Form Description */}
        <p className="form-card-desc">
          {form.description || 'Please fill out this form to submit your details.'}
        </p>
      </div>

      {/* Bottom Section */}
      <div>
        {/* Stats Row */}
        <div className="form-card-stats">
          <span className="stat-item">
            <Icon name="users" size={14} /> {form.responseCount || 0} Responses
          </span>
          <span className="stat-item">
            <Icon name="checkbox" size={14} /> {form.fieldCount || form.fields?.length || 0} Fields
          </span>
        </div>

        {/* Action Bar */}
        <div className="form-card-actions" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-3d-primary btn-sm"
              onClick={() => onCopyLink(form.shareId)}
            >
              <Icon name="copy" size={13} /> Copy Link
            </button>

            <button
              type="button"
              className="btn btn-3d-secondary btn-sm"
              onClick={() => onEdit(form)}
            >
              <Icon name="edit" size={13} /> Edit
            </button>
          </div>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => onViewResponses(form.id)}
              title="View Submissions"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <Icon name="chart" size={13} /> Submissions
            </button>

            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="icon-btn"
              title="Preview Form"
              style={{ padding: '6px' }}
            >
              <Icon name="external-link" size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
