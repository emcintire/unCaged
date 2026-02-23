import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = (req.header('x-request-id') ?? '').trim();
  const id = incoming || randomUUID();

  (req as Request & { requestId?: string }).requestId = id;
  res.setHeader('x-request-id', id);

  next();
};