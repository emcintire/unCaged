import type { NextFunction,Response } from 'express';

import type { AuthenticatedRequest } from '@/types';

export function admin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user?.isAdmin) {
    res.status(403).json({ message: "Ah ah ah! You didn't say the magic word!", code: 'ADMIN_REQUIRED' });
    return;
  }
  next();
}
