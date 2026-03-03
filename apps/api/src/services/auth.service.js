const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signAccessToken } = require('../utils/jwt');

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function register({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ email: normalizedEmail }).lean();

  if (existing) {
    throw createHttpError(409, 'Email already exists');
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    role: 'user',
  });

  return {
    token: signAccessToken(user),
  };
}

async function login({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const passwordValid = await comparePassword(password, user.passwordHash);

  if (!passwordValid) {
    throw createHttpError(401, 'Invalid credentials');
  }

  return {
    token: signAccessToken(user),
  };
}

async function getMe(userId) {
  const user = await User.findById(userId).select('email role').lean();

  if (!user) {
    throw createHttpError(401, 'Unauthorized');
  }

  return {
    email: user.email,
    role: user.role,
  };
}

module.exports = {
  register,
  login,
  getMe,
};
