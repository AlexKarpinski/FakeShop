const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signAccessToken } = require('../utils/jwt');
const { conflict, unauthorized } = require('../utils/errors');

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

async function register({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ email: normalizedEmail }).lean();

  if (existing) {
    throw conflict('Email already exists');
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
    throw unauthorized('Invalid credentials');
  }

  const passwordValid = await comparePassword(password, user.passwordHash);

  if (!passwordValid) {
    throw unauthorized('Invalid credentials');
  }

  return {
    token: signAccessToken(user),
  };
}

async function getMe(userId) {
  const user = await User.findById(userId).select('email role').lean();

  if (!user) {
    throw unauthorized('Unauthorized');
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
