import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

let mongoServer: MongoMemoryReplSet;

// Set test environment variables FIRST, before any imports
process.env.NODE_ENV = 'test';
process.env.JWT_PRIVATE_KEY = 'test-jwt-secret-key-for-testing';
process.env.EMAIL_USERNAME = 'test@example.com';
process.env.EMAIL_PASSWORD = 'test-app-password';

const ensureMongooseDisconnected = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}

const startInMemoryMongo = async (): Promise<string> => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  return mongoServer.getUri();
}

const stopInMemoryMongo = async () => {
  if (!mongoServer) return;
  await mongoServer.stop({ doCleanup: true, force: true });
}

const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

// Set up in-memory MongoDB before all tests
beforeAll(async () => {
  await ensureMongooseDisconnected();

  const mongoUri = await startInMemoryMongo();
  process.env.DB_URL = mongoUri;

  await mongoose.connect(mongoUri);
});

// Clean up after all tests
afterAll(async () => {
  await ensureMongooseDisconnected();
  await stopInMemoryMongo();
}, 10000);

// Clear all collections between tests for isolation
afterEach(async () => {
  await clearDatabase();
});

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
