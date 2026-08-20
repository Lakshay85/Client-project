import rateLimit from 'express-rate-limit';

/** Rate limiter for authentication endpoints (signup, login). */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});

/** Rate limiter for form submission endpoints. */
export const submitRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: {
    message: 'Too many form submissions. Please wait a moment before trying again.',
  },
});
