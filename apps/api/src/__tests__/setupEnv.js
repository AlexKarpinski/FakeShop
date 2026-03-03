const path = require('path');
const dotenv = require('dotenv');

process.env.NODE_ENV = 'test';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.MONGO_URL) {
  throw new Error('Missing MONGO_URL for tests. Set it in apps/api/.env or CI secrets.');
}

if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET for tests. Set it in apps/api/.env or CI secrets.');
}
