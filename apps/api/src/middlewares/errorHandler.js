const config = require('../config/env');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const response = {
    error: err.message || 'Internal Server Error',
  };

  if (config.nodeEnv !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
