import type { Request } from 'express';

export type AuthenticatedRequest<
  TBody = unknown,
  TParams = unknown,
  TQuery = unknown,
> = Request<TParams, unknown, TBody, TQuery> & {
  user?: {
    sub: string;
    isAdmin: boolean;
  };
};
