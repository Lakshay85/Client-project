import { Response, NextFunction } from 'express';
import { formService } from '../services/form.service.js';
import { submissionService } from '../services/submission.service.js';
import { AuthRequest } from '../types/index.js';
import { FormCreateRequest } from '../dto/form.dto.js';

/**
 * Controller for authenticated form CRUD endpoints.
 */
export class FormController {
  /** POST /api/forms — Create a new form */
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const form = await formService.createForm(req.user!.id, req.body as FormCreateRequest);
      res.status(201).json({ message: 'Form created successfully', form });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/forms — List all user forms */
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const forms = await formService.getUserForms(req.user!.id);
      res.json({ forms });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/forms/:id — Get form details */
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const form = await formService.getFormDetails(req.params.id as string, req.user!.id);
      res.json({ form });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/forms/:id — Update a form */
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const form = await formService.updateForm(
        req.params.id as string,
        req.user!.id,
        req.body as FormCreateRequest
      );
      res.json({ message: 'Form updated successfully', form });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/forms/:id — Delete a form */
  async remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await formService.deleteForm(req.params.id as string, req.user!.id);
      res.json({ message: 'Form deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/forms/:id/responses — Get form responses */
  async getResponses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await submissionService.getFormResponses(req.params.id as string, req.user!.id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

export const formController = new FormController();
