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
      />

      {error && <div className="builder-alert error">{error}</div>}

      <div className="builder-body">
        {!isPreview && (
          <FieldPalette
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            onAddField={builder.addFieldFromTemplate}
            onDragStart={dnd.handleTemplateDragStart}
          />
        )}

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
          onSelectField={builder.setSelectedFieldId}
          onMoveField={builder.moveField}
          onDuplicateField={builder.duplicateField}
          onRemoveField={builder.removeField}
          onShowAccessModal={() => setShowAccessModal(true)}
          onDragStart={dnd.setDraggedFieldIndex}
          onDragOver={dnd.handleCanvasDragOver}
          onDrop={dnd.handleCanvasDrop}
        />

        {!isPreview && builder.selectedField && (
          <FieldPropertiesPanel
            selectedField={builder.selectedField}
            onUpdateField={builder.updateSelectedField}
            onRemoveField={builder.removeField}
            onClose={() => builder.setSelectedFieldId(null)}
          />
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
