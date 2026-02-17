import express from 'express';
import cors from 'cors';
import type { Express } from 'express';
import { error } from '@/middleware';
import { setupRoutes } from './routes';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  setupRoutes(app);
  app.use(error);

  return app;
}
