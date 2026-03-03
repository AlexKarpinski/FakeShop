const User = require('../models/User');
const Product = require('../models/Product');
const { hashPassword } = require('../utils/hash');
const resetData = require('./reset');

async function seedData() {
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

  const products = Array.from({ length: 10 }, (_, idx) => {
    const i = idx + 1;
    return {
      name: `Product ${i}`,
      price: i * 10,
      inStock: i * 5,
    };
  });

  await Product.insertMany(products);

  return {
    adminEmail,
    userEmail,
    productsCount: products.length,
  };
}

module.exports = seedData;
