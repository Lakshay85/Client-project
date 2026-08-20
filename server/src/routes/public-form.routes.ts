import { Router } from 'express';
import { publicFormController } from '../controllers/public-form.controller.js';
import { submitRateLimiter } from '../middleware/rate-limiters.js';

const router = Router();

router.get('/:shareId', (req, res, next) => publicFormController.getForm(req, res, next));
router.post('/:shareId/submit', submitRateLimiter, (req, res, next) => publicFormController.submit(req, res, next));

export default router;
