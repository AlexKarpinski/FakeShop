const request = require('supertest');
const User = require('../../models/User');
const { hashPassword } = require('../../utils/hash');
const { makeToken } = require('../helpers/tokens');

describe('integration products + RBAC', () => {
  let app;

  beforeAll(() => {
    app = require('../../app');
  });

  async function createUser({ email, role }) {
    return User.create({
      email,
      role,
      passwordHash: await hashPassword('secret123'),
    });
  }

  it('admin can create product and list contains it', async () => {
    const admin = await createUser({
      email: 'admin-int@example.com',
      role: 'admin',
    });
    const adminToken = makeToken({
      sub: String(admin._id),
      role: admin.role,
      email: admin.email,
    });

    const createRes = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Integration Product',
        price: 25,
        inStock: 4,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.name).toBe('Integration Product');

    const listRes = await request(app).get('/products');
    expect(listRes.status).toBe(200);
    expect(listRes.body.some((item) => item.id === createRes.body.id)).toBe(true);
  });

  it('user cannot create product', async () => {
    const user = await createUser({
      email: 'user-int@example.com',
      role: 'user',
    });
    const userToken = makeToken({
      sub: String(user._id),
      role: user.role,
      email: user.email,
    });

    const createRes = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Should fail',
        price: 10,
        inStock: 1,
      });

    expect(createRes.status).toBe(403);
    expect(createRes.body).toEqual({ error: 'Forbidden' });
  });
});
