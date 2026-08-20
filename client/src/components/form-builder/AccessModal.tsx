import { Icon } from '../../Icons';
import { Button3D } from '../Button3D';

interface AccessModalProps {
  accessType: 'allow_all' | 'allow_only' | 'restrict_specific';
  setAccessType: (v: 'allow_all' | 'allow_only' | 'restrict_specific') => void;
  restrictedEmails: string[];
  emailInput: string;
  setEmailInput: (v: string) => void;
  singleSubmissionOnly: boolean;
  setSingleSubmissionOnly: (v: boolean) => void;
  onAddEmail: () => void;
  onRemoveEmail: (email: string) => void;
  onClose: () => void;
}

/**
 * Access & Limits modal dialog.
 * Configures form submission access permissions and single-submission limits.
 */
export function AccessModal({
  accessType,
  setAccessType,
  restrictedEmails,
  emailInput,
  setEmailInput,
  singleSubmissionOnly,
  setSingleSubmissionOnly,
  onAddEmail,
  onRemoveEmail,
  onClose,
}: AccessModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="card modal-card detail-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        <div className="detail-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'var(--accent-subtle)', color: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="lock" size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 700 }}>
                Submission Access & Security
              </h3>
              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Control who is authorized to submit and response limits.
              </p>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} title="Close">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="detail-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Access Mode Selector */}
          <div>
            <label className="property-label" style={{ marginBottom: '8px' }}>Access Permission Rules</label>
            <div className="access-options-grid">
              {([
                { value: 'allow_all', title: 'Allow All Users', desc: 'Open access: any valid email ID can submit.' },
                { value: 'allow_only', title: 'Allow Specific Users (Whitelist)', desc: 'Only specified email IDs are permitted.' },
                { value: 'restrict_specific', title: 'Restrict Specific Users (Blacklist)', desc: 'Block specific email IDs from submitting.' },
              ] as const).map((opt) => (
                <label key={opt.value} className={`access-radio-card ${accessType === opt.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="accessType"
                    value={opt.value}
                    checked={accessType === opt.value}
                    onChange={() => setAccessType(opt.value)}
                  />
                  <div>
                    <strong>{opt.title}</strong>
                    <span className="radio-desc">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Email Tag Input */}
          {accessType !== 'allow_all' && (
            <div className="email-restriction-input-area" style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <label className="input-sublabel" style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', display: 'block', marginBottom: '8px' }}>
                {accessType === 'allow_only'
                  ? 'Specify email IDs allowed to submit:'
                  : 'Specify email IDs restricted from submitting:'}
              </label>

              <div className="email-tag-input-row" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="email"
                  className="property-input"
                  placeholder="e.g. user@example.com (Press Enter or Click Add)"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onAddEmail();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-3d-primary btn-sm"
                  onClick={onAddEmail}
                  style={{ flexShrink: 0 }}
                >
                  + Add Email
                </button>
              </div>

              {restrictedEmails.length > 0 && (
                <div className="email-tags-wrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {restrictedEmails.map((email) => (
                    <span key={email} className="email-tag-chip">
                      {email}
                      <button
                        type="button"
                        className="remove-email-btn"
                        onClick={() => onRemoveEmail(email)}
                        title="Remove email"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center' }}
                      >
                        <Icon name="x" size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="access-info-note" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                {accessType === 'allow_only'
                  ? `Only ${restrictedEmails.length} specified email address(es) will be allowed.`
                  : `${restrictedEmails.length} specified email address(es) will be blocked.`}
              </div>
            </div>
          )}

          {/* Single Submission Limit */}
          <div>
            <label className="property-label" style={{ marginBottom: '8px' }}>Submission Limit</label>
            <div
              className="single-submission-setting-card"
              style={{
                padding: '14px 16px', background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
              }}
            >
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '14px', cursor: 'pointer', margin: 0,
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <Icon name="check" size={15} style={{ color: 'var(--accent-primary)' }} />
                    <span>Limit to 1 response per user</span>
                  </div>
                  <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                    Each respondent can only fill out and submit this form once. Email address is verified upon submission to prevent duplicate responses.
                  </span>
                </div>
                <div className="toggle-switch-wrapper" style={{ flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={singleSubmissionOnly}
                    onChange={(e) => setSingleSubmissionOnly(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="detail-modal-footer">
          <Button3D variant="primary" size="md" onClick={onClose}>
            Save & Close
          </Button3D>
        </div>
      </div>
    </div>
  );
}
