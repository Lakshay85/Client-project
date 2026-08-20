import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config/app.config.js';
import { userRepository } from '../repositories/user.repository.js';
import { toPublicUser, PublicUser } from '../dto/user.dto.js';
import { UserRow } from '../types/index.js';
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
} from '../exceptions/AppError.js';
import { isValidEmail } from '../utils/validation.js';

/**
 * Service for authentication business logic.
 * Handles signup, login, and JWT token operations.
 */
export class AuthService {
  /** Issue a JWT token for the given user. */
  issueToken(user: UserRow): string {
    return jwt.sign(
      { sub: user.id, email: user.email },
      appConfig.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  /** Verify a JWT token and return the payload. */
  verifyToken(token: string): jwt.JwtPayload {
    return jwt.verify(token, appConfig.jwtSecret) as jwt.JwtPayload;
  }

  /** Register a new user with email/password. */
  async signup(
    name: unknown,
    email: unknown,
    password: unknown
  ): Promise<{ token: string; user: PublicUser }> {
    if (
      typeof name !== 'string' ||
      name.trim().length < 2 ||
      !isValidEmail(email) ||
      typeof password !== 'string' ||
      password.length < 8
    ) {
      throw new ValidationError(
        'Provide a name, valid email, and password of at least 8 characters.'
      );
    }

    const normalizedEmail = (email as string).toLowerCase().trim();
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userRepository.create({
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    return { token: this.issueToken(user), user: toPublicUser(user) };
  }

  /** Authenticate a user with email/password. */
  async login(
    email: unknown,
    password: unknown,
    ipAddress: string | null,
    userAgent: string | null
  ): Promise<{ token: string; user: PublicUser }> {
    if (!isValidEmail(email) || typeof password !== 'string') {
      throw new ValidationError('Email and password are required.');
    }

    const user = await userRepository.findByEmail(
      (email as string).toLowerCase().trim()
    );

    if (
      !user ||
      user.status !== 'active' ||
      !user.password_hash ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      throw new AuthenticationError('Invalid email or password.');
    }

    await userRepository.updateLastLogin(user.id);
    await userRepository.recordLoginEvent(user.id, ipAddress, userAgent);

    return { token: this.issueToken(user), user: toPublicUser(user) };
  }

  /** Get the current authenticated user by token payload. */
  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await userRepository.findById(userId);
    if (!user || user.status !== 'active') {
      throw new AuthenticationError('User is not available.');
    }
    return toPublicUser(user);
  }
}

export const authService = new AuthService();
