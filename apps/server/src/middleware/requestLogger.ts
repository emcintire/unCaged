import type { NextFunction, Request, Response } from 'express';

import { logger } from '@/utils';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startedAt = Date.now();

  res.on('finish', () => {
    logger.info('HTTP request', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
      requestId: (req as Request & { requestId?: string }).requestId,
    });
  });

  next();
};