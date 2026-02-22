import rateLimit from 'express-rate-limit';

const fiveMinutesInMs = 5 * 60 * 1000;

type AuthLimiterOptions = {
  windowMs?: number;
  max?: number;
};

export const createAuthLimiter = ({ windowMs = fiveMinutesInMs, max = 15 }: AuthLimiterOptions = {}) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
  });
