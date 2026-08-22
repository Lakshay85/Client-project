import 'dotenv/config';
import { OAuth2Client } from 'google-auth-library';

export const googleClientId = process.env.GOOGLE_CLIENT_ID;
export const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
export const googleRedirectUri =
  process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:4000/api/auth/google/callback';

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    'CRITICAL: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables must be set.'
  );
}

export const googleClient = new OAuth2Client(
  googleClientId,
  googleClientSecret,
  googleRedirectUri
);
