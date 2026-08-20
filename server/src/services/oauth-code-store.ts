import crypto from 'crypto';
import { PublicUser } from '../dto/user.dto.js';

interface OAuthSession {
  token: string;
  user: PublicUser;
  expiresAt: number;
}

/**
 * In-memory store for OAuth authorization code exchange.
 * Manages short-lived exchange codes generated during the OAuth callback flow.
 */
export class OAuthCodeStore {
  private readonly store = new Map<string, OAuthSession>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startCleanup();
  }

  /** Generate a new exchange code and store the session. */
  create(token: string, user: PublicUser, ttlMs = 60_000): string {
    const code = crypto.randomBytes(32).toString('hex');
    this.store.set(code, {
      token,
      user,
      expiresAt: Date.now() + ttlMs,
    });
    return code;
  }

  /** Exchange a code for the stored session. Deletes the code after use. */
  exchange(code: string): OAuthSession | null {
    const session = this.store.get(code);
    if (!session) return null;

    this.store.delete(code);

    if (session.expiresAt < Date.now()) return null;

    return session;
  }

  /** Start periodic cleanup of expired codes. */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [code, session] of this.store.entries()) {
        if (session.expiresAt < now) this.store.delete(code);
      }
    }, 5 * 60 * 1000);
  }

  /** Stop cleanup (for graceful shutdown). */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export const oauthCodeStore = new OAuthCodeStore();
