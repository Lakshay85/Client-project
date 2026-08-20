import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/AppError.js';
import { appConfig } from '../config/app.config.js';

/**
 * Global error handler middleware.
 * Catches all errors and returns a consistent JSON response.
 * AppError subclasses get their specific status codes.
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (!appConfig.isProduction) {
    console.error(error);
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  res.status(500).json({ message: 'An internal server error occurred.' });
}
