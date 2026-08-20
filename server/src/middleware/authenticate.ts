import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { AuthRequest } from '../types/index.js';
import { AuthenticationError } from '../exceptions/AppError.js';

/**
 * JWT authentication middleware.
 * Validates the Bearer token and attaches the user to the request.
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AuthenticationError('Authentication required.');
    }

    const payload = authService.verifyToken(header.slice(7));
    const user = typeof payload.sub === 'string'
      ? await userRepository.findById(payload.sub)
      : undefined;

    if (!user || user.status !== 'active') {
      throw new AuthenticationError('User is not available.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }
  }
}
