import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// Set test environment variables FIRST, before any imports
process.env.NODE_ENV = 'test';
process.env.JWT_PRIVATE_KEY = 'test-jwt-secret-key-for-testing';

async function ensureMongooseDisconnected() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}

async function startInMemoryMongo(): Promise<string> {
  mongoServer = await MongoMemoryServer.create();
  return mongoServer.getUri();
}

async function stopInMemoryMongo() {
  if (!mongoServer) return;
  await mongoServer.stop({ doCleanup: true, force: true });
}

async function clearDatabase() {
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
