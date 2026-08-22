import { useState } from 'react';
import { FIELD_TEMPLATES } from './fieldTemplates';
import { FormField } from './types';
import { useFormBuilder } from './hooks/useFormBuilder';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useFormPublish } from './hooks/useFormPublish';
import { BuilderHeader } from './components/form-builder/BuilderHeader';
import { FieldPalette } from './components/form-builder/FieldPalette';
import { FormCanvas } from './components/form-builder/FormCanvas';
import { FieldPropertiesPanel } from './components/form-builder/FieldPropertiesPanel';
import { AccessModal } from './components/form-builder/AccessModal';

interface FormBuilderProps {
  token: string;
  apiUrl: string;
  onBack: () => void;
  onFormCreated: (shareId: string) => void;
  formId?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialFields?: FormField[];
  initialAccessType?: 'allow_all' | 'allow_only' | 'restrict_specific';
  initialRestrictedEmails?: string[];
  initialSingleSubmissionOnly?: boolean;
}

/**
 * FormBuilder composition root.
 * Orchestrates hooks and child components — contains no business logic itself.
 *
 * Refactored from 1,270 lines → ~100 lines.
 * All state logic lives in hooks, all rendering in child components.
 */
export function FormBuilder({
  token,
  apiUrl,
  onBack,
  onFormCreated,
  formId,
  initialTitle,
  initialDescription,
  initialFields,
  initialAccessType = 'allow_all',
  initialRestrictedEmails = [],
  initialSingleSubmissionOnly = true,
}: FormBuilderProps) {
  const builder = useFormBuilder({
    initialTitle,
    initialDescription,
    initialFields,
    initialAccessType,
    initialRestrictedEmails,
    initialSingleSubmissionOnly,
  });

  const dnd = useDragAndDrop(
    builder.fields,
    builder.setFields,
    builder.addFieldFromTemplate
  );

  const { publishing, error, handlePublish } = useFormPublish({
    token,
    apiUrl,
    formId,
    onFormCreated,
  });

  const [showAccessModal, setShowAccessModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [mobileTab, setMobileTab] = useState<'palette' | 'canvas' | 'properties'>('canvas');

  const handleAddField = (template: any) => {
    builder.addFieldFromTemplate(template);
    // Switch to canvas tab so user sees the newly added field immediately
    setMobileTab('canvas');
  };

  const handleSelectField = (id: string) => {
    builder.setSelectedFieldId(id);
    // Switch to properties tab so mobile user can immediately configure it
    setMobileTab('properties');
  };

  const handleCloseProperties = () => {
    builder.setSelectedFieldId(null);
    setMobileTab('canvas');
  };

  const onPublish = () =>
    handlePublish({
      title: builder.title,
      description: builder.description,
      accessType: builder.accessType,
      restrictedEmails: builder.restrictedEmails,
      singleSubmissionOnly: builder.singleSubmissionOnly,
      emailInput: builder.emailInput,
      fields: builder.fields,
    });

  return (
    <div className="form-builder-container">
      <BuilderHeader
        isPreview={isPreview}
        setIsPreview={setIsPreview}
        accessType={builder.accessType}
        singleSubmissionOnly={builder.singleSubmissionOnly}
        onShowAccessModal={() => setShowAccessModal(true)}
        onBack={onBack}
        onPublish={onPublish}
        publishing={publishing}
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
        hasSelectedField={!!builder.selectedField}
        fieldsCount={builder.fields.length}
      />

      {error && <div className="builder-alert error">{error}</div>}

      <div className={`builder-body mobile-tab-${mobileTab}`}>
        {!isPreview && (
          <div className={`builder-palette-pane ${mobileTab === 'palette' ? 'mobile-active' : ''}`}>
            <FieldPalette
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              onAddField={handleAddField}
              onDragStart={dnd.handleTemplateDragStart}
            />
          </div>
        )}

        <div className={`builder-canvas-pane ${mobileTab === 'canvas' || isPreview ? 'mobile-active' : ''}`}>
          <FormCanvas
            fields={builder.fields}
            selectedFieldId={builder.selectedFieldId}
            isPreview={isPreview}
            title={builder.title}
            description={builder.description}
            accessType={builder.accessType}
            restrictedEmails={builder.restrictedEmails}
            singleSubmissionOnly={builder.singleSubmissionOnly}
            onSetTitle={builder.setTitle}
            onSetDescription={builder.setDescription}
            onSelectField={handleSelectField}
            onMoveField={builder.moveField}
            onDuplicateField={builder.duplicateField}
            onRemoveField={builder.removeField}
            onShowAccessModal={() => setShowAccessModal(true)}
            onDragStart={dnd.setDraggedFieldIndex}
            onDragOver={dnd.handleCanvasDragOver}
            onDrop={dnd.handleCanvasDrop}
            onOpenPalette={() => setMobileTab('palette')}
          />
        </div>

        {!isPreview && builder.selectedField && (
          <div className={`builder-properties-pane ${mobileTab === 'properties' ? 'mobile-active' : ''}`}>
            <FieldPropertiesPanel
              selectedField={builder.selectedField}
              onUpdateField={builder.updateSelectedField}
              onRemoveField={(id) => {
                builder.removeField(id);
                setMobileTab('canvas');
              }}
              onClose={handleCloseProperties}
            />
          </div>
        )}
      </div>

      {showAccessModal && (
        <AccessModal
          accessType={builder.accessType}
          setAccessType={builder.setAccessType}
          restrictedEmails={builder.restrictedEmails}
          emailInput={builder.emailInput}
          setEmailInput={builder.setEmailInput}
          singleSubmissionOnly={builder.singleSubmissionOnly}
          setSingleSubmissionOnly={builder.setSingleSubmissionOnly}
          onAddEmail={builder.addEmailTag}
          onRemoveEmail={builder.removeEmailTag}
          onClose={() => setShowAccessModal(false)}
        />
      )}
    </div>
  );
}
