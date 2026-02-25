import type { Express } from 'express';

import { authRouter } from '@/auth';
import { movieRouter } from '@/movies';
import { quoteRouter } from '@/quotes';
import { reviewRouter } from '@/reviews';
import { userRouter } from '@/users';

export const setupRoutes = (app: Express) => {
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/reviews', reviewRouter);
  app.use('/api/quotes', quoteRouter);
  app.use('/api/movies', movieRouter);
}
