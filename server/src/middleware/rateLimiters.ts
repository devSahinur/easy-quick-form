import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';
import logger from '../utils/logger';
import { env } from '../utils/env';

const createLimiter = (
  windowMs: number,
  max: number,
  message: string,
): RequestHandler => {
  // Disable rate limiting in tests so suites aren't throttled.
  if (env.NODE_ENV === 'test') return (_req, _res, next) => next();

  return rateLimit({
    windowMs,
    max,
    message: { message },
    handler: (req, res, _next, options) => {
      logger.warn(
        { method: req.method, url: req.url, ip: req.ip },
        `Rate limit exceeded: ${(options.message as { message: string }).message}`,
      );
      res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// 5 login attempts per minute per IP.
export const loginLimiter = createLimiter(
  60 * 1000,
  5,
  'Too many login attempts from this IP, please try again in a minute!',
);

// 10 new accounts per hour per IP.
export const signupLimiter = createLimiter(
  60 * 60 * 1000,
  10,
  'Too many accounts created from this IP, please try again later!',
);

// 5 password-reset requests per hour per IP (limits enumeration & email spam).
export const forgotPasswordLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  'Too many password reset requests from this IP, please try again later!',
);
