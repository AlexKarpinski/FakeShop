const jwt = require('jsonwebtoken');
const config = require('../config/env');

const ACCESS_TOKEN_EXPIRES_IN = '1h';

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email,
    },
    config.jwtSecret,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = {
  ACCESS_TOKEN_EXPIRES_IN,
  signAccessToken,
  verifyAccessToken,
};
