import type { Express } from 'express';
import mongoose from 'mongoose';
import winston from 'winston';
import type { Server } from 'http';

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not defined`);
  }
  return value;
}

const createLogger = () => {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
    exceptionHandlers: [new winston.transports.File({ filename: 'exceptions.log' })],
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    );
  }

  return logger;
}

const connectToDatabase = async (): Promise<void> => {
  mongoose.set('strictQuery', false);

  const dbUrl = getRequiredEnv('DB_URL');
  await mongoose.connect(dbUrl);
}

const startHttpServer = (app: Express): Server => {
  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port);

  server.on('listening', () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on('error', (error: any) => {
    console.error('Server error:', error);
  });

  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Server closed');
    });
  });

  return server;
}

export const bootstrap = async (app: Express): Promise<Server> => {
  const logger = createLogger();

  process.on('unhandledRejection', (ex) => {
    logger.error('Unhandled Rejection:', ex);
  });

  await connectToDatabase();

  return startHttpServer(app);
}
