import crypto from 'crypto';
import { googleClient, googleClientId } from '../config/google.config.js';
import { userRepository } from '../repositories/user.repository.js';
import { authService } from './auth.service.js';
import { toPublicUser, PublicUser } from '../dto/user.dto.js';
import { UserRow } from '../types/index.js';
import {
  ValidationError,
  ForbiddenError,
} from '../exceptions/AppError.js';

interface GoogleAuthResult {
  token: string;
  user: PublicUser;
}

/**
 * Service for Google OAuth authentication.
 * Consolidates the duplicated findOrCreateGoogleUser logic
 * that was previously in both the callback and POST routes.
 */
export class GoogleAuthService {
  /** Generate Google OAuth consent URL. */
  generateAuthUrl(): string {
    return googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'select_account',
    });
  }

  /** Verify a Google ID token and extract the payload. */
  async verifyIdToken(idToken: string): Promise<Record<string, any>> {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new ValidationError('Email not returned by Google.');
    }
    return payload;
  }

  /** Exchange a Google authorization code for tokens and extract payload. */
  async exchangeCodeForPayload(code: string): Promise<Record<string, any>> {
    const { tokens } = await googleClient.getToken(code);
    if (!tokens.id_token) {
      throw new ValidationError('Failed to get ID token from Google.');
    }
    return this.verifyIdToken(tokens.id_token);
  }

  /**
   * Find or create a user from Google OAuth payload.
   * Shared logic — eliminates the duplication between callback and POST routes.
   */
  async findOrCreateGoogleUser(
    payload: Record<string, any>,
    ipAddress: string | null,
    userAgent: string | null
  ): Promise<GoogleAuthResult> {
    const googleId = payload.sub;
    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split('@')[0];

    let user: UserRow | undefined =
      (await userRepository.findByGoogleId(googleId)) ||
      (await userRepository.findByEmail(email));

    if (user) {
      if (user.status !== 'active') {
        throw new ForbiddenError('Your account has been disabled.');
      }
      if (!user.google_id) {
        await userRepository.linkGoogleId(user.id, googleId);
      }
    } else {
      user = await userRepository.create({
        id: crypto.randomUUID(),
        name,
        email,
        googleId,
      });
    }

    if (!user) throw new Error('User creation failed.');

    await userRepository.updateLastLogin(user.id);
    await userRepository.recordLoginEvent(user.id, ipAddress, userAgent);

    return {
      token: authService.issueToken(user),
      user: toPublicUser(user),
    };
  }
}

export const googleAuthService = new GoogleAuthService();
