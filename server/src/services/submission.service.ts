import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { appConfig } from '../config/app.config.js';
import { formRepository } from '../repositories/form.repository.js';
import { submissionRepository } from '../repositories/submission.repository.js';
import { AccessControlFactory } from '../strategies/access-control.factory.js';
import { safeJsonParse } from '../utils/json-helpers.js';
import { isValidEmail } from '../utils/validation.js';
import { ValidationError, NotFoundError } from '../exceptions/AppError.js';
import { SubmissionRequest, FormattedSubmission } from '../dto/submission.dto.js';

/**
 * Service for form submission business logic.
 * Orchestrates access control validation (via Strategy Pattern),
 * duplicate submission checks, required field validation, and persistence.
 */
export class SubmissionService {
  /** Submit a response to a public form. */
  async submitResponse(
    shareId: string,
    body: SubmissionRequest,
    req: Request
  ): Promise<{ submissionId: string }> {
    const { answers, submitterEmail } = body;

    // 1. Find the published form
    const form = await formRepository.findPublishedByShareId(shareId);
    if (!form) {
      throw new NotFoundError('Form not found or is closed for submissions.');
    }

    const formId = form.id;
    const isSingleSubmission = Boolean(form.singleSubmissionOnly);

    // 2. Resolve submitter email from multiple sources
    let emailToUse = this.resolveSubmitterEmail(submitterEmail, answers, req);

    // 3. Single submission enforcement
    if (isSingleSubmission) {
      if (!isValidEmail(emailToUse)) {
        throw new ValidationError(
          'Please enter a valid email address. This form is configured to allow only 1 submission per user.'
        );
      }
      const alreadySubmitted = await submissionRepository.hasSubmittedByEmail(formId, emailToUse);
      if (alreadySubmitted) {
        const { ForbiddenError } = await import('../exceptions/AppError.js');
        throw new ForbiddenError(
          `You have already submitted a response to this form (${emailToUse}). This form allows only 1 submission per user.`
        );
      }
    }

    // 4. Access control via Strategy Pattern
    const accessType = form.accessType || 'allow_all';
    const restrictedList = safeJsonParse<string[]>(form.restrictedEmails, [])
      .map((e: string) => String(e).trim().toLowerCase());

    const strategy = AccessControlFactory.create(accessType);
    strategy.validate(emailToUse, restrictedList);

    // 5. Validate required fields
    const fields = await formRepository.findRequiredFieldsByFormId(formId);
    if (answers) {
      for (const field of fields) {
        if (field.isRequired) {
          const val = answers[field.id];
          if (val === undefined || val === null || val === '' ||
              (Array.isArray(val) && val.length === 0)) {
            throw new ValidationError(`"${field.label}" is required.`);
          }
        }
      }
    }

    // 6. Persist the submission
    const ip = req.ip || req.socket.remoteAddress || null;
    const submissionId = await submissionRepository.create({
      formId,
      submitterIp: ip,
      submitterEmail: emailToUse,
    });

    // 7. Persist answers
    if (answers && typeof answers === 'object') {
      const validFieldIds = new Set(fields.map((f) => f.id));
      await submissionRepository.insertAnswers(submissionId, answers, validFieldIds);
    }

    return { submissionId };
  }

  /** Get all responses for a form (for the creator). */
  async getFormResponses(
    formId: string,
    userId: string
  ): Promise<{
    formTitle: string;
    fields: any[];
    submissions: FormattedSubmission[];
  }> {
    const form = await formRepository.findByIdAndUserId(formId, userId);
    if (!form) {
      throw new NotFoundError('Form not found.');
    }

    const fields = await formRepository.findFieldsSummaryByFormId(formId);
    const submissions = await submissionRepository.findByFormId(formId);

    const submissionIds = submissions.map((s) => s.id);
    const answersMap = await submissionRepository.findAnswersBySubmissionIds(submissionIds);

    const formattedSubmissions: FormattedSubmission[] = submissions.map((s) => ({
      id: s.id,
      submittedAt: s.submittedAt,
      submitterIp: s.submitterIp,
      submitterEmail: s.submitterEmail,
      status: s.status || 'pending',
      answers: answersMap[s.id] || {},
    }));

    return {
      formTitle: form.title,
      fields,
      submissions: formattedSubmissions,
    };
  }

  /** Update a submission status (approve/reject/pending) */
  async updateSubmissionStatus(
    formId: string,
    submissionId: string,
    userId: string,
    status: unknown
  ): Promise<{ submissionId: string; status: 'pending' | 'approved' | 'rejected' }> {
    if (status !== 'pending' && status !== 'approved' && status !== 'rejected') {
      throw new ValidationError("Invalid status. Must be 'pending', 'approved', or 'rejected'.");
    }

    const form = await formRepository.findByIdAndUserId(formId, userId);
    if (!form) {
      throw new NotFoundError('Form not found or you do not have permission to modify its responses.');
    }

    const submission = await submissionRepository.findByIdAndFormId(submissionId, formId);
    if (!submission) {
      throw new NotFoundError('Submission not found for this form.');
    }

    await submissionRepository.updateStatus(submissionId, status);

    return {
      submissionId,
      status,
    };
  }

  /**
   * Resolve the submitter email from multiple sources:
   * 1. Explicit submitterEmail in body
   * 2. Bearer token email claim
   * 3. Auto-detected email from answers
   */
  private resolveSubmitterEmail(
    submitterEmail: unknown,
    answers: Record<string, unknown> | undefined,
    req: Request
  ): string {
    // 1. Explicit email
    let email = typeof submitterEmail === 'string' ? submitterEmail.trim().toLowerCase() : '';

    // 2. From Bearer token
    if (!email && req.headers.authorization?.startsWith('Bearer ')) {
      try {
        const payload = jwt.verify(
          req.headers.authorization.slice(7),
          appConfig.jwtSecret
        ) as jwt.JwtPayload;
        if (typeof payload.email === 'string') {
          email = payload.email.trim().toLowerCase();
        }
      } catch (_) { /* ignore invalid tokens */ }
    }

    // 3. Auto-detect from answers
    if (!email && answers && typeof answers === 'object') {
      for (const val of Object.values(answers)) {
        if (typeof val === 'string' && /^\S+@\S+\.\S+$/.test(val.trim())) {
          email = val.trim().toLowerCase();
          break;
        }
      }
    }

    return email;
  }
}

export const submissionService = new SubmissionService();
