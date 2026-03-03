const authService = require('../services/auth.service');

function isValidEmail(email) {
  return typeof email === 'string' && email.trim().length > 0;
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

async function register(req, res) {
  const { email, password } = req.body || {};

  if (!isValidEmail(email) || !isValidPassword(password)) {
    return res.status(400).json({ error: 'Email and password (min 6 chars) are required' });
  }

  const result = await authService.register({ email, password });
  return res.status(201).json(result);
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!isValidEmail(email) || !isValidPassword(password)) {
    return res.status(400).json({ error: 'Email and password (min 6 chars) are required' });
  }

  const result = await authService.login({ email, password });
  return res.status(200).json(result);
}

async function me(req, res) {
  const user = await authService.getMe(req.user.id);
  return res.status(200).json(user);
}

module.exports = {
  register,
  login,
  me,
};
