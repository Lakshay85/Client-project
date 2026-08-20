import { Icon } from '../../Icons';
import { TiltCard } from '../TiltCard';
import { Button3D } from '../Button3D';

interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}

/**
 * Delete form confirmation modal with 3D glass effect.
 * Extracted from main.tsx to enforce SRP.
 */
export function DeleteConfirmModal({ onConfirm, onCancel, deleting }: DeleteConfirmModalProps) {
  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 13, 20, 0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: '20px',
      }}
    >
      <TiltCard
        maxRotateX={8}
        maxRotateY={8}
        glowColor="rgba(239, 68, 68, 0.4)"
        style={{ width: '100%', maxWidth: '440px', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <div
          className="modal-card"
          style={{
            padding: '32px 28px',
            width: '100%',
            maxWidth: '440px',
            textAlign: 'center',
            background: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            color: '#ffffff',
          }}
        >
          <div
            className="modal-icon-badge"
            style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', margin: '0 auto 16px',
              boxShadow: '0 0 24px rgba(239, 68, 68, 0.45)',
            }}
          >
            <Icon name="trash" size={28} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
            Delete Form?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: '0 0 24px', lineHeight: 1.5 }}>
            Are you sure you want to delete this form? All form fields and collected responses will be permanently deleted.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button3D variant="ghost" size="md" onClick={onCancel} disabled={deleting} style={{ flex: 1 }}>
              Cancel
            </Button3D>
            <Button3D variant="danger" size="md" onClick={onConfirm} loading={deleting} style={{ flex: 1 }}>
              Delete
            </Button3D>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
