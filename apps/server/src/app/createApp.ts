import express from 'express';
import cors from 'cors';
import type { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { error } from '@/middleware';
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
        xAuthToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-auth-token',
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

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  setupRoutes(app);

  const swaggerDocs = swaggerJSDoc(swaggerOptions);
  app.get('/api-docs.json', (_req, res) => res.json(swaggerDocs));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  app.use(error);

  return app;
}
