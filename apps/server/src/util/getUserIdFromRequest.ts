import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types';
import { getIdFromToken } from '@/util';

/**
 * Extract user ID from authentication token
 * Returns null and sends 401 response if token is missing
 */
export const getUserIdFromRequest = (
  req: AuthenticatedRequest,
  res: Response
): string | null => {
  const token = req.header('x-auth-token');
  if (!token) {
    res.status(401).send('No token provided');
    return null;
  }
  return getIdFromToken(token);
}
