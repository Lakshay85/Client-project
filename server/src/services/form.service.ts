import { formRepository } from '../repositories/form.repository.js';
import { formatFormRow, formatFieldRow, FormCreateRequest } from '../dto/form.dto.js';
import { normalizeEmailList } from '../utils/validation.js';
import { ValidationError, NotFoundError } from '../exceptions/AppError.js';
import { AccessType } from '../types/index.js';

/**
 * Service for form CRUD business logic.
 * Validates inputs and delegates persistence to FormRepository.
 */
export class FormService {
  /** Validate and normalize form access settings. */
  private normalizeAccessSettings(
    accessType: unknown,
    restrictedEmails: unknown,
    singleSubmissionOnly: unknown
  ): {
    validAccessType: AccessType;
    normalizedEmails: string[];
    isSingleSubmission: boolean;
  } {
    const validAccessType: AccessType =
      accessType === 'allow_only' || accessType === 'restrict_specific'
        ? accessType
        : 'allow_all';

    const normalizedEmails = Array.isArray(restrictedEmails)
      ? normalizeEmailList(restrictedEmails)
      : [];

    if (validAccessType !== 'allow_all' && normalizedEmails.length === 0) {
      throw new ValidationError(
        `Please specify at least one valid email address for ${
          validAccessType === 'allow_only' ? 'allowed' : 'restricted'
        } access.`
      );
    }

    return {
      validAccessType,
      normalizedEmails,
      isSingleSubmission: singleSubmissionOnly !== undefined
        ? Boolean(singleSubmissionOnly)
        : true,
    };
  }

  /** Create a new form. */
  async createForm(userId: string, body: FormCreateRequest) {
    const { title, description, accessType, restrictedEmails, singleSubmissionOnly, fields } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new ValidationError('Form title is required.');
    }
    if (!Array.isArray(fields) || fields.length === 0) {
      throw new ValidationError('Form must contain at least one field.');
    }

    const { validAccessType, normalizedEmails, isSingleSubmission } =
      this.normalizeAccessSettings(accessType, restrictedEmails, singleSubmissionOnly);

    const { formId, shareId } = await formRepository.create({
      userId,
      title: title.trim(),
      description: description?.trim() || null,
      accessType: validAccessType,
      restrictedEmails: normalizedEmails.length > 0 ? normalizedEmails : null,
      singleSubmissionOnly: isSingleSubmission,
      fields,
    });

    return {
      id: formId,
      shareId,
      title,
      description,
      accessType: validAccessType,
      restrictedEmails: normalizedEmails,
      singleSubmissionOnly: isSingleSubmission,
      fieldCount: fields.length,
    };
  }

  /** Update an existing form. */
  async updateForm(formId: string, userId: string, body: FormCreateRequest) {
    const { title, description, accessType, restrictedEmails, singleSubmissionOnly, fields } = body;

    const exists = await formRepository.existsByIdAndUserId(formId, userId);
    if (!exists) {
      throw new NotFoundError('Form not found or unauthorized.');
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new ValidationError('Form title is required.');
    }
    if (!Array.isArray(fields) || fields.length === 0) {
      throw new ValidationError('Form must contain at least one field.');
    }

    const { validAccessType, normalizedEmails, isSingleSubmission } =
      this.normalizeAccessSettings(accessType, restrictedEmails, Boolean(singleSubmissionOnly));

    await formRepository.update({
      formId,
      userId,
      title: title.trim(),
      description: description?.trim() || null,
      accessType: validAccessType,
      restrictedEmails: normalizedEmails.length > 0 ? normalizedEmails : null,
      singleSubmissionOnly: isSingleSubmission,
      fields,
    });

    return {
      id: formId,
      title,
      description,
      accessType: validAccessType,
      restrictedEmails: normalizedEmails,
      singleSubmissionOnly: isSingleSubmission,
    };
  }

  /** Get all forms owned by the user. */
  async getUserForms(userId: string) {
    const rows = await formRepository.findAllByUserId(userId);
    return rows.map(formatFormRow);
  }

  /** Get a single form with full details (for creator). */
  async getFormDetails(formId: string, userId: string) {
    const form = await formRepository.findByIdAndUserId(formId, userId);
    if (!form) {
      throw new NotFoundError('Form not found.');
    }

    const fields = await formRepository.findFieldsByFormId(formId);
    const responseCount = await formRepository.getResponseCount(formId);

    return {
      ...formatFormRow(form),
      fields: fields.map(formatFieldRow),
      responseCount,
    };
  }

  /** Delete a form. */
  async deleteForm(formId: string, userId: string): Promise<void> {
    await formRepository.deleteByIdAndUserId(formId, userId);
  }

  /** Get a published form for public access. */
  async getPublicForm(shareId: string) {
    const form = await formRepository.findPublishedByShareId(shareId);
    if (!form) {
      throw new NotFoundError('Form not found or is no longer available.');
    }

    const fields = await formRepository.findFieldsByFormId(form.id);
    const isRestricted = (form.accessType || 'allow_all') !== 'allow_all';
    const isSingleSubmission = Boolean(form.singleSubmissionOnly);

    return {
      id: form.id,
      shareId: form.shareId,
      title: form.title,
      description: form.description,
      accessType: form.accessType || 'allow_all',
      singleSubmissionOnly: isSingleSubmission,
      isRestricted,
      fields: fields.map(formatFieldRow),
    };
  }
}

export const formService = new FormService();
