import { useState, DragEvent } from 'react';
import { FieldTemplate, FormField } from '../types';

/**
 * Custom hook for drag-and-drop functionality in the FormBuilder.
 */
export function useDragAndDrop(
  fields: FormField[],
  setFields: (fields: FormField[]) => void,
  addFieldFromTemplate: (template: FieldTemplate, targetIndex?: number) => void
) {
  const [draggedTemplate, setDraggedTemplate] = useState<FieldTemplate | null>(null);
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);

  const handleTemplateDragStart = (template: FieldTemplate) => {
    setDraggedTemplate(template);
    setDraggedFieldIndex(null);
  };

  const handleCanvasDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: DragEvent<HTMLElement>, dropIndex?: number) => {
    e.preventDefault();
    if (draggedTemplate) {
      addFieldFromTemplate(draggedTemplate, dropIndex);
      setDraggedTemplate(null);
    } else if (draggedFieldIndex !== null && dropIndex !== undefined) {
      const updated = [...fields];
      const [moved] = updated.splice(draggedFieldIndex, 1);
      updated.splice(dropIndex, 0, moved);
      setFields(updated.map((f, i) => ({ ...f, sortOrder: i })));
      setDraggedFieldIndex(null);
    }
  };

  return {
    draggedTemplate,
    draggedFieldIndex,
    setDraggedFieldIndex,
    handleTemplateDragStart,
    handleCanvasDragOver,
    handleCanvasDrop,
  };
}
