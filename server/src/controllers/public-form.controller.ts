import { Request, Response, NextFunction } from 'express';
import { formService } from '../services/form.service.js';
import { submissionService } from '../services/submission.service.js';
import { SubmissionRequest } from '../dto/submission.dto.js';

/**
 * Controller for public (unauthenticated) form endpoints.
 */
export class PublicFormController {
  /** GET /api/public/forms/:shareId — Get public form details */
  async getForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const form = await formService.getPublicForm(req.params.shareId as string);
      res.json({ form });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/public/forms/:shareId/submit — Submit a form response */
  async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await submissionService.submitResponse(
        req.params.shareId as string,
        req.body as SubmissionRequest,
        req
      );
      res.status(201).json({ message: 'Response submitted successfully!', ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const publicFormController = new PublicFormController();
