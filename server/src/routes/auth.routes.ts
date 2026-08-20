import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authRateLimiter } from '../middleware/rate-limiters.js';

const router = Router();

// Email/password auth
router.post('/signup', authRateLimiter, (req, res, next) => authController.signup(req, res, next));
router.post('/login', authRateLimiter, (req, res, next) => authController.login(req, res, next));

// Current user
router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));

// Google OAuth
router.get('/google/url', (req, res) => authController.getGoogleAuthUrl(req, res));
router.get('/google', authRateLimiter, (req, res) => authController.redirectToGoogle(req, res));
router.get('/google/callback', (req, res) => authController.googleCallback(req, res));
router.post('/google/exchange', (req, res, next) => authController.exchangeOAuthCode(req, res, next));
router.post('/google', authRateLimiter, (req, res, next) => authController.googleAuth(req, res, next));

export default router;
