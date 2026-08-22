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
        glowColor="rgba(239, 68, 68, 0.3)"
        style={{ width: '100%', maxWidth: '440px', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <div
          className="modal-card delete-confirm-modal-card"
          style={{
            padding: '32px 28px',
            width: '100%',
            maxWidth: '440px',
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
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
            }}
          >
            <Icon name="trash" size={26} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>
            Delete Form?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', margin: '0 0 24px', lineHeight: 1.5 }}>
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
