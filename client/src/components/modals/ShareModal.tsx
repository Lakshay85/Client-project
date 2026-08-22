import { Icon } from '../../Icons';
import { TiltCard } from '../TiltCard';
import { Button3D } from '../Button3D';

interface ShareModalProps {
  shareId: string;
  onCopyLink: (shareId: string) => void;
  onClose: () => void;
}

/**
 * Form published / share link modal with 3D glass effect.
 * Extracted from main.tsx lines 246-355.
 */
export function ShareModal({ shareId, onCopyLink, onClose }: ShareModalProps) {
  const shareUrl = `${window.location.origin}/form/${shareId}`;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 13, 20, 0.65)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <TiltCard
        maxRotateX={6}
        maxRotateY={6}
        glowColor="rgba(14, 140, 163, 0.3)"
        style={{ width: '100%', maxWidth: '480px', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <div
          className="modal-card share-modal-card"
          style={{
            padding: '36px 32px',
            width: '100%',
            maxWidth: '480px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            color: 'var(--text-primary)',
          }}
        >
          <div
            className="modal-icon-badge"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 20px',
            }}
          >
            <Icon name="check" size={30} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>
            Form Published Successfully!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.5 }}>
            Your form is live and ready to collect responses from users.
          </p>

          <div className="share-link-box">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="share-link-input"
            />
            <Button3D
              variant="primary"
              size="sm"
              icon={<Icon name="link" size={14} />}
              onClick={() => onCopyLink(shareId)}
            >
              Copy Link
            </Button3D>
          </div>

          <div className="modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href={shareUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <Button3D variant="secondary" size="md" style={{ width: '100%' }}>
                <Icon name="external-link" size={16} /> Open Public Form
              </Button3D>
            </a>
            <Button3D variant="ghost" size="md" onClick={onClose} style={{ width: '100%' }}>
              Return to Dashboard
            </Button3D>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
