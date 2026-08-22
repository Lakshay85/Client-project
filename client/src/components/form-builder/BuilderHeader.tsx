import { Icon } from '../../Icons';
import { Button3D } from '../Button3D';
import { ThemeToggle } from '../ThemeToggle';

export type MobileBuilderTab = 'palette' | 'canvas' | 'properties';

interface BuilderHeaderProps {
  isPreview: boolean;
  setIsPreview: (v: boolean) => void;
  accessType: string;
  singleSubmissionOnly: boolean;
  onShowAccessModal: () => void;
  onBack: () => void;
  onPublish: () => void;
  publishing: boolean;
  mobileTab: MobileBuilderTab;
  setMobileTab: (tab: MobileBuilderTab) => void;
  hasSelectedField: boolean;
  fieldsCount: number;
}

/**
 * Top toolbar for the FormBuilder.
 * Contains back button, edit/preview toggle, access config, publish button, and mobile studio panel tabs.
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
  mobileTab,
  setMobileTab,
  hasSelectedField,
  fieldsCount,
}: BuilderHeaderProps) {
  return (
    <header className="builder-header">
      {/* Desktop & Mobile Main Row */}
      <div className="builder-header-main-row">
        <div className="header-left">
          <Button3D variant="ghost" size="sm" icon={<Icon name="arrow-left" size={14} />} onClick={onBack}>
            Back
          </Button3D>
          <span className="builder-title-badge">Studio</span>
        </div>

        <div className="header-center desktop-only">
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

        <div className="header-right">
          <button
            type="button"
            className={`btn ${accessType !== 'allow_all' || singleSubmissionOnly ? 'btn-3d-primary' : 'btn-outline'} btn-sm access-config-btn`}
            onClick={onShowAccessModal}
            title="Configure submission access permissions and limits"
          >
            <Icon name="lock" size={13} />
            <span className="access-btn-label">Access & Limits</span>
            {(accessType !== 'allow_all' || singleSubmissionOnly) && (
              <span className="access-active-dot" />
            )}
          </button>
          <ThemeToggle size="sm" />
          <Button3D
            variant="primary"
            size="sm"
            icon={<Icon name="zap" size={13} />}
            onClick={onPublish}
            loading={publishing}
            className="publish-form-btn"
          >
            Publish
          </Button3D>
        </div>
      </div>

      {/* Mobile Sub-Header: Mode Switcher & Panel Switcher (< 1024px) */}
      <div className="builder-mobile-subbar mobile-only">
        <div className="mode-toggle mobile-mode-toggle">
          <button
            type="button"
            className={`toggle-btn ${!isPreview ? 'active' : ''}`}
            onClick={() => setIsPreview(false)}
          >
            <Icon name="edit" size={13} /> Studio
          </button>
          <button
            type="button"
            className={`toggle-btn ${isPreview ? 'active' : ''}`}
            onClick={() => setIsPreview(true)}
          >
            <Icon name="eye" size={13} /> Preview
          </button>
        </div>

        {!isPreview && (
          <div className="builder-mobile-panel-tabs">
            <button
              type="button"
              className={`builder-tab-btn ${mobileTab === 'palette' ? 'active' : ''}`}
              onClick={() => setMobileTab('palette')}
            >
              <Icon name="plus" size={13} />
              <span>Elements</span>
            </button>
            <button
              type="button"
              className={`builder-tab-btn ${mobileTab === 'canvas' ? 'active' : ''}`}
              onClick={() => setMobileTab('canvas')}
            >
              <Icon name="textarea" size={13} />
              <span>Canvas ({fieldsCount})</span>
            </button>
            <button
              type="button"
              className={`builder-tab-btn ${mobileTab === 'properties' ? 'active' : ''} ${!hasSelectedField ? 'disabled' : ''}`}
              onClick={() => hasSelectedField && setMobileTab('properties')}
              disabled={!hasSelectedField}
              title={hasSelectedField ? 'Edit selected field properties' : 'Select a field to edit'}
            >
              <Icon name="settings" size={13} />
              <span>Settings</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
