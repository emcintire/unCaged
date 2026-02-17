import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '@/types';

export function admin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user?.isAdmin) {
    res.status(401).send("Ah ah ah! You didn't say the magic word!");
    return;
  }
  next();
}
