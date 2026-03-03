jest.mock('../../services/auth.service', () => ({
  register: jest.fn(),
  login: jest.fn(),
  getMe: jest.fn(),
}));

const request = require('supertest');
const app = require('../../app');
const authService = require('../../services/auth.service');
const { signAccessToken } = require('../../utils/jwt');
const { conflict, unauthorized } = require('../../utils/errors');

function makeToken({ sub = 'u1', role = 'user', email = 'user@example.com' } = {}) {
  return signAccessToken({
    _id: sub,
    role,
    email,
  });
}

describe('HTTP /auth + /me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('returns 201 with token', async () => {
      authService.register.mockResolvedValue({ token: 'token-1' });

      const res = await request(app).post('/auth/register').send({
        email: 'user@example.com',
        password: 'secret12',
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ token: 'token-1' });
      expect(authService.register).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secret12',
      });
    });

    it('returns 409 for existing email', async () => {
      authService.register.mockRejectedValue(conflict('Email already exists'));

      const res = await request(app).post('/auth/register').send({
        email: 'user@example.com',
        password: 'secret12',
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Email already exists');
    });

    it('returns 400 for invalid payload', async () => {
      const res = await request(app).post('/auth/register').send({
        email: '',
        password: '123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email and password (min 6 chars) are required');
      expect(authService.register).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/login', () => {
    it('returns 200 with token', async () => {
      authService.login.mockResolvedValue({ token: 'token-2' });

      const res = await request(app).post('/auth/login').send({
        email: 'user@example.com',
        password: 'secret12',
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ token: 'token-2' });
      expect(authService.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secret12',
      });
    });

    it('returns 401 for invalid credentials', async () => {
      authService.login.mockRejectedValue(unauthorized('Invalid credentials'));

      const res = await request(app).post('/auth/login').send({
        email: 'user@example.com',
        password: 'secret12',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('returns 400 for invalid payload', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'user@example.com',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email and password (min 6 chars) are required');
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('GET /me', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/me');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
      expect(authService.getMe).not.toHaveBeenCalled();
    });

    it('returns 200 for valid token', async () => {
      const token = makeToken();
      authService.getMe.mockResolvedValue({
        email: 'user@example.com',
        role: 'user',
      });

      const res = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        email: 'user@example.com',
        role: 'user',
      });
      expect(authService.getMe).toHaveBeenCalledWith('u1');
    });
  });
});
