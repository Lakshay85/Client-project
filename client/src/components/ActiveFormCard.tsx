import React from 'react';
import { Form } from '../types';
import { Icon } from '../Icons';
import { TiltCard } from './TiltCard';

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
  onViewResponses
}) => {
  const shareUrl = `${window.location.origin}/?form=${form.shareId}`;
  const restrictedCount = form.restrictedEmails?.length || 0;
  const accessBadgeLabel =
    form.accessType === 'allow_only'
      ? `Whitelisted (${restrictedCount})`
      : form.accessType === 'restrict_specific'
        ? `Blacklisted (${restrictedCount})`
        : `Public Access`;

  return (
    <TiltCard maxRotateX={6} maxRotateY={8} glowColor="rgba(6, 182, 212, 0.25)">
      <div
        className="dashboard-active-form-card"
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '280px',
          background: 'linear-gradient(145deg, #0c1427 0%, #060b17 100%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.1)',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header Row */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06b6d4',
                flexShrink: 0
              }}
            >
              <Icon name="textarea" size={22} />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background:
                    form.accessType === 'allow_only'
                      ? '#fef9c3'
                      : form.accessType === 'restrict_specific'
                        ? '#fee2e2'
                        : 'rgba(6, 182, 212, 0.15)',
                  color:
                    form.accessType === 'allow_only'
                      ? '#854d0e'
                      : form.accessType === 'restrict_specific'
                        ? '#991b1b'
                        : '#22d3ee',
                  border:
                    form.accessType === 'allow_only'
                      ? '1px solid #fde047'
                      : form.accessType === 'restrict_specific'
                        ? '1px solid #fca5a5'
                        : '1px solid rgba(6, 182, 212, 0.3)'
                }}
              >
                <Icon name={form.accessType === 'allow_only' ? 'lock' : form.accessType === 'restrict_specific' ? 'block' : 'url'} size={13} />
                {accessBadgeLabel}
              </span>

              <span
                style={{
                  fontSize: '11px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  background: 'rgba(6, 78, 59, 0.75)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                {form.status.toUpperCase()}
              </span>

              {/* Red Delete Button */}
              <button
                onClick={() => onDelete(form.id)}
                title="Delete Form"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(239, 68, 68, 0.65), inset -2px -2px 4px rgba(0, 0, 0, 0.3), inset 2px 2px 4px rgba(255, 255, 255, 0.35)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
          </div>

          {/* Form Title */}
          <h3
            style={{
              fontSize: '20px',
              fontWeight: 800,
              margin: '0 0 8px',
              color: '#ffffff',
              letterSpacing: '-0.01em',
              lineHeight: 1.3
            }}
          >
            {form.title}
          </h3>

          {/* Form Description */}
          <p
            style={{
              fontSize: '13px',
              color: '#94a3b8',
              margin: '0 0 16px',
              lineHeight: 1.5
            }}
          >
            {form.description || 'Please fill out this form to submit your details.'}
          </p>
        </div>

        {/* Bottom Section */}
        <div>
          {/* Stats Row - Clean Transparent Row with Subtle Divider Lines */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '12px 0',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '20px',
              background: 'transparent'
            }}
          >
            <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="users" size={15} /> {form.responseCount || 0} Responses
            </span>
            <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="checkbox" size={15} /> {form.fieldCount || form.fields?.length || 0} Fields
            </span>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => onCopyLink(form.shareId)}
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14px',
                  borderRadius: '24px',
                  padding: '10px 20px',
                  boxShadow: '0 4px 20px rgba(6, 182, 212, 0.5), inset -2px -2px 4px rgba(0, 0, 0, 0.2), inset 2px 2px 4px rgba(255, 255, 255, 0.3)',
                  border: '1px solid rgba(34, 211, 238, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Icon name="copy" size={16} /> Copy Link
              </button>

              <button
                onClick={() => onEdit(form)}
                style={{
                  background: '#e2e8f0',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '24px',
                  padding: '10px 20px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Icon name="edit" size={15} /> Edit
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => onViewResponses(form.id)}
                title="View Submissions"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 8px',
                  borderRadius: '8px'
                }}
              >
                <Icon name="users" size={15} /> ({form.responseCount || 0})
              </button>

              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '6px 8px' }}
                title="Preview Form"
              >
                <Icon name="eye" size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </TiltCard>
  );
};
