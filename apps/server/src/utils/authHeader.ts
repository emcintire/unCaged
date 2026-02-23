import type { Request } from 'express';

export const getTokenFromRequest = (req: Pick<Request, 'header'>): string | null => {
  const authorization = req.header('authorization');
  if (authorization) {
    const bearerMatch = authorization.match(/^Bearer\s+(.+)$/i);
    if (bearerMatch?.[1]) {
      return bearerMatch[1].trim();
    }
  }

  return null;
};
