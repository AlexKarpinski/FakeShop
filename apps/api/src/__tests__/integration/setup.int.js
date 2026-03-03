const mongoose = require('mongoose');
const { GenericContainer } = require('testcontainers');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Cart = require('../../models/Cart');
const AuditLog = require('../../models/AuditLog');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/fakeshop-int';

let mongoContainer;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

beforeAll(async () => {
  mongoContainer = await new GenericContainer('mongo:7').withExposedPorts(27017).start();

  process.env.MONGO_URL = `mongodb://${mongoContainer.getHost()}:${mongoContainer.getMappedPort(
    27017
  )}/fakeshop_int`;

  let lastError;

  for (let attempt = 1; attempt <= 20; attempt += 1) {
    try {
      await mongoose.connect(process.env.MONGO_URL, {
        serverSelectionTimeoutMS: 1000,
      });
      return;
    } catch (error) {
      lastError = error;
      await delay(500);
    }
  }

  throw lastError;
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoContainer) {
    await mongoContainer.stop();
  }
});
