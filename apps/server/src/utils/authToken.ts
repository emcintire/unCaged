import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ACCESS_TTL_SECONDS, getRequiredEnv, REFRESH_TTL_DAYS } from '@/utils';

export const signAccessToken = (payload: { sub: string; isAdmin: boolean }) => {
  const key = getRequiredEnv('JWT_PRIVATE_KEY');
  return jwt.sign(payload, key, { expiresIn: ACCESS_TTL_SECONDS });
}

export const createRefreshTokenValue = () => {
  return crypto.randomBytes(32).toString('base64url');
}

export const hashRefreshToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const refreshExpiryDate = () => {
  return new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
}