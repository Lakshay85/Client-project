import { Icon } from '../../Icons';
import { Button3D } from '../Button3D';
import { ThemeToggle } from '../ThemeToggle';

interface BuilderHeaderProps {
  isPreview: boolean;
  setIsPreview: (v: boolean) => void;
  accessType: string;
  singleSubmissionOnly: boolean;
  onShowAccessModal: () => void;
  onBack: () => void;
  onPublish: () => void;
  publishing: boolean;
}

/**
 * Top toolbar for the FormBuilder.
 * Contains back button, edit/preview toggle, access config, and publish button.
 */
export function BuilderHeader({
  isPreview,
  setIsPreview,
  accessType,
  singleSubmissionOnly,
  onShowAccessModal,
  onBack,
  onPublish,
  publishing,
}: BuilderHeaderProps) {
  return (
    <header className="builder-header">
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button3D variant="ghost" size="sm" icon={<Icon name="arrow-left" size={14} />} onClick={onBack}>
          Back
        </Button3D>
        <span className="builder-title-badge">Studio</span>
      </div>

      <div className="header-center">
        <div className="mode-toggle">
          <button
            type="button"
            className={`toggle-btn ${!isPreview ? 'active' : ''}`}
            onClick={() => setIsPreview(false)}
          >
            <Icon name="edit" size={14} /> Edit Studio
          </button>
          <button
            type="button"
            className={`toggle-btn ${isPreview ? 'active' : ''}`}
            onClick={() => setIsPreview(true)}
          >
            <Icon name="eye" size={14} /> Live Preview
          </button>
        </div>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          className={`btn ${accessType !== 'allow_all' || singleSubmissionOnly ? 'btn-3d-primary' : 'btn-outline'} btn-sm`}
          onClick={onShowAccessModal}
          title="Configure submission access permissions and limits"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Icon name="lock" size={14} />
          <span>Access & Limits</span>
          {(accessType !== 'allow_all' || singleSubmissionOnly) && (
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
          )}
        </button>
        <ThemeToggle size="sm" />
        <Button3D
          variant="primary"
          size="md"
          icon={<Icon name="zap" size={14} />}
          onClick={onPublish}
          loading={publishing}
        >
          Publish Form
        </Button3D>
      </div>
    </header>
  );
}
