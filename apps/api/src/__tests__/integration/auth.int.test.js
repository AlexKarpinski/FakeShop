const request = require('supertest');

describe('integration auth flow', () => {
  let app;

  beforeAll(() => {
    app = require('../../app');
  });

  it('register -> login -> me happy path', async () => {
    const email = 'integration-user@example.com';
    const password = 'secret123';

    const registerRes = await request(app).post('/auth/register').send({ email, password });
    expect(registerRes.status).toBe(201);
    expect(typeof registerRes.body.token).toBe('string');

    const loginRes = await request(app).post('/auth/login').send({ email, password });
    expect(loginRes.status).toBe(200);
    expect(typeof loginRes.body.token).toBe('string');

    const meRes = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body).toEqual({
      email,
      role: 'user',
    });
  });
});
