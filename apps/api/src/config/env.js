const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEFAULT_PORT = 4000;
const DEFAULT_NODE_ENV = 'development';

const nodeEnv = process.env.NODE_ENV || DEFAULT_NODE_ENV;

const config = {
  port: Number(process.env.PORT) || DEFAULT_PORT,
  nodeEnv,
  isTest: nodeEnv === 'test',
  mongoUrl: process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET,
};

if (!config.mongoUrl) {
  throw new Error('Missing required environment variable: MONGO_URL');
}

if (!config.jwtSecret) {
  throw new Error('Missing required environment variable: JWT_SECRET');
}

module.exports = config;
