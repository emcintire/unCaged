import type { Request, Response, NextFunction } from 'express';
import { isHttpError, logger } from '@/utils';

export const error = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = (req as Request & { requestId?: string }).requestId ?? req.headers['x-request-id'];

  if (isHttpError(err)) {
    const shouldLogAsError = err.status >= 500;
    const logPayload = {
      method: req.method,
      path: req.originalUrl,
      status: err.status,
      code: err.code,
      requestId,
      details: err.details,
    };

    if (shouldLogAsError) {
      logger.error(err.message, logPayload);
    } else {
      logger.warn(err.message, logPayload);
    }

    res.status(err.status).json({
      message: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  const fallbackMessage = err instanceof Error ? err.message : 'Internal server error';
  logger.error(fallbackMessage, {
    method: req.method,
    path: req.originalUrl,
    status: 500,
    requestId,
    error: err,
  });

  res.status(500).json({ message: 'Internal server error' });
}
