import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { appConfig } from './config/app.config.js';
import { errorHandler } from './middleware/error-handler.js';
import { pool } from './database/connection.js';
import authRoutes from './routes/auth.routes.js';
import formRoutes from './routes/form.routes.js';
import publicFormRoutes from './routes/public-form.routes.js';

/**
 * Express application factory.
 * Configures middleware, mounts routes, and registers error handling.
 */
export function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  const { raw: rawOrigins, list: allowedOrigins } = appConfig.clientOrigins;
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          rawOrigins === '*' ||
          allowedOrigins.includes(origin)
        ) {
          return callback(null, true);
        }
        return callback(new Error('CORS: origin not allowed'), false);
      },
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '1mb' }));

  // Health check
  app.get('/api/health', async (_req, res, next) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
      next(error);
    }
  });

  // Route mounting
  app.use('/api/auth', authRoutes);
  app.use('/api/forms', formRoutes);
  app.use('/api/public/forms', publicFormRoutes);

  // 404 handler
  app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));

  // Global error handler
  app.use(errorHandler);

  return app;
}
