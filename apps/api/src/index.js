const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/env');
const { connectDb } = require('./config/db');

const MAX_DB_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry() {
  for (let attempt = 1; attempt <= MAX_DB_RETRIES; attempt += 1) {
    try {
      await connectDb();
      return;
    } catch (error) {
      if (attempt === MAX_DB_RETRIES) {
        console.error(`Unable to connect to MongoDB after ${MAX_DB_RETRIES} attempts.`);
        throw error;
      }

      console.error(
        `Retrying MongoDB connection in ${RETRY_DELAY_MS}ms (${attempt + 1}/${MAX_DB_RETRIES})`
      );
      await delay(RETRY_DELAY_MS);
    }
  }
}

async function start() {
  await connectWithRetry();

  const server = app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });

  let shuttingDown = false;

  async function shutdown(signal) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    console.log(`${signal} received. Shutting down...`);

    server.close(async () => {
      try {
        await mongoose.connection.close(false);
        console.log('MongoDB connection closed');
      } catch (error) {
        console.error('Error closing MongoDB connection:', error.message);
      } finally {
        process.exit(0);
      }
    });

    setTimeout(() => {
      process.exit(1);
    }, 5000).unref();
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('Failed to start API:', error.message);
  process.exit(1);
});
