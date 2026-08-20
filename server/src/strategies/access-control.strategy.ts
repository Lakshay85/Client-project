import { ForbiddenError } from '../exceptions/AppError.js';
import { isValidEmail } from '../utils/validation.js';

/**
 * Strategy interface for form submission access control.
 * Each implementation encapsulates a distinct access policy.
 *
 * @pattern Strategy (GoF Behavioral)
 */
export interface AccessControlStrategy {
  /**
   * Validate whether the given email is permitted to submit.
   * @throws ForbiddenError if access is denied
   */
  validate(email: string, restrictedList: string[]): void;

  /** Whether this strategy requires a valid email to evaluate. */
  requiresEmail(): boolean;
}

/**
 * Allow all users — no access restrictions.
 */
export class AllowAllStrategy implements AccessControlStrategy {
  validate(_email: string, _restrictedList: string[]): void {
    // No restrictions — all users are permitted
  }

  requiresEmail(): boolean {
    return false;
  }
}

/**
 * Whitelist strategy — only specified emails are permitted.
 */
export class WhitelistStrategy implements AccessControlStrategy {
  validate(email: string, restrictedList: string[]): void {
    if (!isValidEmail(email)) {
      throw new ForbiddenError(
        'Please enter a valid email address to verify your permission to submit this form.'
      );
    }
    if (!restrictedList.includes(email)) {
      throw new ForbiddenError(
        `Access Denied: The email address '${email}' is not authorized to submit responses for this form.`
      );
    }
  }

  requiresEmail(): boolean {
    return true;
  }
}

/**
 * Blacklist strategy — specified emails are blocked.
 */
export class BlacklistStrategy implements AccessControlStrategy {
  validate(email: string, restrictedList: string[]): void {
    if (!isValidEmail(email)) {
      throw new ForbiddenError(
        'Please enter a valid email address to verify your permission to submit this form.'
      );
    }
    if (restrictedList.includes(email)) {
      throw new ForbiddenError(
        `Access Denied: The email address '${email}' is restricted from submitting responses for this form.`
      );
    }
  }

  requiresEmail(): boolean {
    return true;
  }
}
