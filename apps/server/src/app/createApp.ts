import type { Express } from 'express';
import express from 'express';
import { writeFileSync } from 'fs';
import helmet from 'helmet';
import { resolve } from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { error, requestId, requestLogger } from '@/middleware';

import { setupRoutes } from './routes';
import { swaggerOptions } from './swaggerOptions';

export const createApp = (): Express => {
  const app = express();
  const isDevelopment = process.env.NODE_ENV === 'development';

  app.use(helmet());
  app.use(requestId);
  if (isDevelopment) {
    app.use(requestLogger);
  }
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  setupRoutes(app);

  const swaggerDocs = swaggerJSDoc(swaggerOptions);
  if (isDevelopment) {
    writeFileSync(resolve(__dirname, '../../openapi.json'), JSON.stringify(swaggerDocs, null, 2));
  }
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  app.use(error);

  return app;
};
