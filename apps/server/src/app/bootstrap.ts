import type { Express } from 'express';
import mongoose from 'mongoose';
import type { Server } from 'http';
import { getRequiredEnv, logger } from '@/utils';

const connectToDatabase = async (): Promise<void> => {
  mongoose.set('strictQuery', false);
  const dbUrl = getRequiredEnv('DB_URL');
  await mongoose.connect(dbUrl);
}

const startHttpServer = (app: Express): Server => {
  const port = Number(process.env.PORT) || 3000;
  return app.listen(port);
}

export const bootstrap = async (app: Express): Promise<Server> => {
  process.on('uncaughtException', (ex) => {
    logger.error('Uncaught Exception', ex);
  });

  process.on('unhandledRejection', (ex) => {
    logger.error('Unhandled Rejection', ex);
  });

  await connectToDatabase();

  const server = startHttpServer(app);

  server.on('listening', () => {
    logger.info(`Server running on http://localhost:${Number(process.env.PORT) || 3000}`);
  });

  server.on('error', (error: unknown) => {
    logger.error('Server error', error);
  });

  process.on('SIGTERM', () => {
    server.close(() => {
      logger.info('Server closed');
    });
  });

  return server;
}
