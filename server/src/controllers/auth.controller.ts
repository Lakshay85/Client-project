import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { googleAuthService } from '../services/google-auth.service.js';
import { oauthCodeStore } from '../services/oauth-code-store.js';
import { appConfig } from '../config/app.config.js';
import { AuthRequest } from '../types/index.js';
import { ValidationError } from '../exceptions/AppError.js';

/**
 * Controller for authentication endpoints.
 * Delegates all business logic to AuthService / GoogleAuthService.
 */
export class AuthController {
  /** POST /api/auth/signup */
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body as Record<string, unknown>;
      const result = await authService.signup(name, email, password);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/auth/login */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as Record<string, unknown>;
      const ip = req.ip || req.socket.remoteAddress || null;
      const userAgent = req.get('user-agent') ?? null;
      const result = await authService.login(email, password, ip, userAgent);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/auth/me */
  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getCurrentUser(req.user!.id);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/auth/google/url */
  getGoogleAuthUrl(_req: Request, res: Response): void {
    const url = googleAuthService.generateAuthUrl();
    res.json({ url });
  }

  /** GET /api/auth/google — redirect to Google consent */
  redirectToGoogle(_req: Request, res: Response): void {
    const url = googleAuthService.generateAuthUrl();
    res.redirect(url);
  }

  /** GET /api/auth/google/callback — handle Google OAuth redirect */
  async googleCallback(req: Request, res: Response): Promise<void> {
    const clientOrigin = appConfig.clientOrigins.primary;
    try {
      const code = req.query.code as string;
      if (!code) {
        res.redirect(`${clientOrigin}/?auth_error=${encodeURIComponent('Authorization code missing')}`);
        return;
      }

      const payload = await googleAuthService.exchangeCodeForPayload(code);
      const ip = req.ip || req.socket.remoteAddress || null;
      const userAgent = req.get('user-agent') ?? null;
      const result = await googleAuthService.findOrCreateGoogleUser(payload, ip, userAgent);

      const exchangeCode = oauthCodeStore.create(result.token, result.user);
      res.redirect(`${clientOrigin}/?oauth_code=${exchangeCode}`);
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.redirect(`${clientOrigin}/?auth_error=${encodeURIComponent('Google authentication failed')}`);
    }
  }

  /** POST /api/auth/google/exchange — exchange OAuth code for token */
  exchangeOAuthCode(req: Request, res: Response, next: NextFunction): void {
    try {
      const { code } = req.body as { code?: string };
      if (!code) {
        throw new ValidationError('Invalid or expired authorization code.');
      }

      const session = oauthCodeStore.exchange(code);
      if (!session) {
        throw new ValidationError('Invalid or expired authorization code.');
      }

      res.json({ token: session.token, user: session.user });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/auth/google — direct Google ID token auth */
  async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken, code, credential } = req.body as {
        idToken?: string;
        code?: string;
        credential?: string;
      };

      const tokenToVerify = idToken || credential;
      let payload: Record<string, any> | undefined;

      if (tokenToVerify) {
        payload = await googleAuthService.verifyIdToken(tokenToVerify);
      } else if (code) {
        payload = await googleAuthService.exchangeCodeForPayload(code);
      }

      if (!payload || !payload.email) {
        throw new ValidationError('Invalid Google authentication request or missing email.');
      }

      const ip = req.ip || req.socket.remoteAddress || null;
      const userAgent = req.get('user-agent') ?? null;
      const result = await googleAuthService.findOrCreateGoogleUser(payload, ip, userAgent);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
