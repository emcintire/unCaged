import type { Express } from 'express';
import express from 'express';
import helmet from 'helmet';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { error, requestId, requestLogger } from '@/middleware';

import { setupRoutes } from './routes';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'unCaged API',
      version: '1.0.0',
    },
    servers: [{ url: `http://localhost:${Number(process.env.PORT) || 3000}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './src/auth/auth.routes.ts',
    './src/movies/movie.routes.ts',
    './src/quotes/quote.routes.ts',
    './src/reviews/review.routes.ts',
    './src/users/user.routes.ts',
  ],
};

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
  app.get('/api-docs.json', (_req, res) => res.json(swaggerDocs));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  app.use(error);

  return app;
};
