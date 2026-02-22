import type { Request, Response, NextFunction } from 'express';

export const error = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err.message, err);
  res.status(500).send('Something went wrong.');
}
