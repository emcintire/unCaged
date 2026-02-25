import type { NextFunction,Response } from 'express';
import jwt from 'jsonwebtoken';

import type { AuthenticatedRequest } from '@/types';
import { getRequiredEnv, getTokenFromRequest } from '@/utils';

export const auth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ message: 'Unauthorized', code: 'AUTH_TOKEN_MISSING' });
    return;
  }

  try {
    const jwtPrivateKey = getRequiredEnv('JWT_PRIVATE_KEY');
    const decoded = jwt.verify(token, jwtPrivateKey) as {
      sub: string;
      isAdmin: boolean;
    };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized', code: 'AUTH_TOKEN_INVALID' });
  }
};
