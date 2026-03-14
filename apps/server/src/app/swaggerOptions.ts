import type swaggerJSDoc from 'swagger-jsdoc';

export const swaggerOptions: swaggerJSDoc.Options = {
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
    './src/issues/issue.routes.ts',
    './src/movies/movie.routes.ts',
    './src/quotes/quote.routes.ts',
    './src/reviews/review.routes.ts',
    './src/users/user.routes.ts',
  ],
};
