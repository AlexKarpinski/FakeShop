const User = require('../models/User');
const Product = require('../models/Product');
const { hashPassword } = require('../utils/hash');
const resetData = require('./reset');

const DEFAULT_OPTIONS = {
  productsCount: 10,
  stock: 10,
  priceStart: 10,
  priceStep: 10,
  reset: true,
};

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseInteger(value, field, min) {
  if (!Number.isInteger(value) || value < min) {
    throw createHttpError(400, `${field} must be an integer >= ${min}`);
  }

  return value;
}

function parseSeedOptions(input = {}) {
  const options = {
    ...DEFAULT_OPTIONS,
    ...(input || {}),
  };

  if (options.reset !== true) {
    throw createHttpError(400, 'seed without reset is not supported');
  }

  return {
    productsCount: parseInteger(options.productsCount, 'productsCount', 0),
    stock: parseInteger(options.stock, 'stock', 0),
    priceStart: parseInteger(options.priceStart, 'priceStart', 0),
    priceStep: parseInteger(options.priceStep, 'priceStep', 0),
    reset: true,
  };
}

async function seedData(rawOptions) {
  const options = parseSeedOptions(rawOptions);

  await resetData();

  const adminEmail = 'admin@example.com';
  const userEmail = 'user@example.com';

  const [adminPasswordHash, userPasswordHash] = await Promise.all([
    hashPassword('admin123'),
    hashPassword('user123'),
  ]);

  await User.create([
    {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
    {
      email: userEmail,
      passwordHash: userPasswordHash,
      role: 'user',
    },
  ]);

  const products = Array.from({ length: options.productsCount }, (_, idx) => {
    const i = idx + 1;
    return {
      name: `Product ${i}`,
      price: options.priceStart + idx * options.priceStep,
      inStock: options.stock,
    };
  });

  if (products.length > 0) {
    await Product.insertMany(products);
  }

  return {
    adminEmail,
    userEmail,
    productsCount: products.length,
  };
}

module.exports = seedData;
