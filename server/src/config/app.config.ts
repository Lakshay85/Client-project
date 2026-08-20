import 'dotenv/config';

export const appConfig = {
  port: Number(process.env.PORT ?? 4000),

  jwtSecret: (() => {
    const secret = process.env.JWT_SECRET;
    const isDefault =
      !secret ||
      secret === 'development-only-secret-change-me' ||
      secret === 'change-this-development-secret-before-deploying';

    if (isDefault && process.env.NODE_ENV === 'production') {
      throw new Error(
        'CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing or set to a default value.'
      );
    }

    return secret || 'development-only-secret-change-me';
  })(),

  clientOrigins: (() => {
    const raw = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
    return {
      raw,
      list: raw.split(',').map((o) => o.trim()),
      primary: raw.split(',')[0].trim(),
    };
  })(),

  isProduction: process.env.NODE_ENV === 'production',
} as const;
