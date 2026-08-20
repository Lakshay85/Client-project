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
        background: 'rgba(10, 13, 20, 0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}
    >
      <TiltCard
        maxRotateX={8}
        maxRotateY={8}
        glowColor="rgba(79, 70, 229, 0.4)"
        style={{ width: '100%', maxWidth: '480px', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <div
          className="modal-card"
          style={{
            padding: '36px',
            width: '100%',
            maxWidth: '480px',
            textAlign: 'center',
            background: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            color: '#ffffff',
          }}
        >
          <div
            className="modal-icon-badge"
            style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', margin: '0 auto 20px',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Icon name="check" size={32} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
            Form Published Successfully!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 24px' }}>
            Your form is live and ready to collect responses from users.
          </p>

          <div
            className="share-link-box"
            style={{
              display: 'flex', gap: '8px', marginBottom: '24px',
              background: 'rgba(15, 23, 42, 0.7)', padding: '6px',
              borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <input
              type="text"
              readOnly
              value={shareUrl}
              style={{
                flex: 1, border: 'none', background: 'transparent',
                padding: '8px 12px', fontSize: '13px', color: '#ffffff',
                fontWeight: 600, outline: 'none',
              }}
            />
            <Button3D variant="primary" size="sm" onClick={() => onCopyLink(shareId)}>
              Copy Link
            </Button3D>
          </div>

          <div className="modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href={shareUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <Button3D variant="secondary" size="md" style={{ width: '100%' }}>
                <Icon name="external-link" size={16} /> Open Public Form
              </Button3D>
            </a>
            <Button3D variant="ghost" size="md" onClick={onClose}>
              Return to Dashboard
            </Button3D>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
