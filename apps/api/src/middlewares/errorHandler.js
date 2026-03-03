const config = require('../config/env');

function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier';
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key';
  }

  const response = {
    error: message,
  };

  if (config.nodeEnv !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
