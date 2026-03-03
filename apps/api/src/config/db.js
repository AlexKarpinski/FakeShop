const mongoose = require('mongoose');
const config = require('./env');

async function connectDb() {
  try {
    await mongoose.connect(config.mongoUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

module.exports = { connectDb };
