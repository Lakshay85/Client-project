import { Router } from 'express';
import { formController } from '../controllers/form.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// All form routes require authentication
router.use(authenticate);

router.post('/', (req, res, next) => formController.create(req, res, next));
router.get('/', (req, res, next) => formController.list(req, res, next));
router.get('/:id', (req, res, next) => formController.getById(req, res, next));
router.put('/:id', (req, res, next) => formController.update(req, res, next));
router.delete('/:id', (req, res, next) => formController.remove(req, res, next));
router.get('/:id/responses', (req, res, next) => formController.getResponses(req, res, next));
router.patch('/:id/responses/:submissionId/status', (req, res, next) => formController.updateSubmissionStatus(req, res, next));
router.patch('/:id/responses/:submissionId', (req, res, next) => formController.updateSubmissionStatus(req, res, next));

export default router;
