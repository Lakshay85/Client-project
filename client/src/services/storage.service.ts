/**
 * Centralized localStorage service.
 * Eliminates the 3 legacy key prefix sprawl (formenclave_, formguard_, ember_)
 * checked across 4+ files.
 */

const TOKEN_KEY = 'formenclave_token';
const USER_KEY = 'formenclave_user';

/** All legacy key prefixes to support migration. */
const LEGACY_TOKEN_KEYS = ['formguard_token', 'ember_token'];
const LEGACY_USER_KEYS = ['formguard_user', 'ember_user'];

export const StorageService = {
  /** Get the stored auth token, checking legacy keys as fallback. */
  getToken(): string | null {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      LEGACY_TOKEN_KEYS.reduce<string | null>(
        (found, key) => found || localStorage.getItem(key),
        null
      )
    );
  },

  /** Get the stored user object, checking legacy keys as fallback. */
  getUser<T>(): T | null {
    const raw =
      localStorage.getItem(USER_KEY) ||
      LEGACY_USER_KEYS.reduce<string | null>(
        (found, key) => found || localStorage.getItem(key),
        null
      );
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  /** Store auth credentials. */
  setAuth(token: string, user: unknown): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /** Clear all auth data including legacy keys. */
  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    LEGACY_TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
    LEGACY_USER_KEYS.forEach((k) => localStorage.removeItem(k));
  },
};
