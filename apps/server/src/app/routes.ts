import type { Express } from 'express';
import path from 'path';
import { movieRouter } from '@/movies';
import { quoteRouter } from '@/quotes';
import { reviewRouter } from '@/reviews';
import { userRouter } from '@/users';

export function setupRoutes(app: Express) {
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/users', userRouter);
  app.use('/api/reviews', reviewRouter);
  app.use('/api/quotes', quoteRouter);
  app.use('/api/movies/quote', quoteRouter); // kept for iOS backwards compatibility
  app.use('/api/movies', movieRouter);

  app.get('/privacy', (_request, response) => {
    response.sendFile(path.join(__dirname, '../public/privacy.html'));
  });

  app.get('/support', (_request, response) => {
    response.sendFile(path.join(__dirname, '../public/support.html'));
  });
}
