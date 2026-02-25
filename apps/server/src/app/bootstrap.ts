import type { Express } from 'express';
import type { Server } from 'http';
import mongoose from 'mongoose';

import { getRequiredEnv, logger } from '@/utils';

const connectToDatabase = async (): Promise<void> => {
  mongoose.set('strictQuery', false);
  const dbUrl = getRequiredEnv('DB_URL');
  await mongoose.connect(dbUrl);
};

const startHttpServer = (app: Express): Server => {
  const port = Number(process.env.PORT) || 3000;
  return app.listen(port);
};

export const bootstrap = async (app: Express): Promise<Server> => {
  await connectToDatabase();

  const server = startHttpServer(app);
  let isShuttingDown = false;

  const gracefulShutdown = (signal: string, exitCode: number): void => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    logger.warn('Shutdown initiated', { signal, exitCode });

    const forceExitTimer = setTimeout(() => {
      logger.error('Force exiting after shutdown timeout', { signal, exitCode });
      process.exit(exitCode);
    }, 10_000);

    server.close(async () => {
      try {
        await mongoose.connection.close();
        clearTimeout(forceExitTimer);
        logger.info('Server and database connections closed');
        process.exit(exitCode);
      } catch (shutdownError) {
        clearTimeout(forceExitTimer);
        logger.error('Error during shutdown', shutdownError);
        process.exit(1);
      }
    });
  };

  process.on('uncaughtException', (ex) => {
    logger.error('Uncaught Exception', ex);
    gracefulShutdown('uncaughtException', 1);
  });

  process.on('unhandledRejection', (ex) => {
    logger.error('Unhandled Rejection', ex);
    gracefulShutdown('unhandledRejection', 1);
  });

  server.on('listening', () => {
    logger.info(`Server running on http://localhost:${Number(process.env.PORT) || 3000}`);
  });

  server.on('error', (error: unknown) => {
    logger.error('Server error', error);
    gracefulShutdown('serverError', 1);
  });

  process.on('SIGTERM', () => {
    gracefulShutdown('SIGTERM', 0);
  });

  process.on('SIGINT', () => {
    gracefulShutdown('SIGINT', 0);
  });

  return server;
};
