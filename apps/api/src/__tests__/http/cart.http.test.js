jest.mock('../../services/cart.service', () => ({
  addItem: jest.fn(),
  getCart: jest.fn(),
  removeItem: jest.fn(),
  checkout: jest.fn(),
}));

const request = require('supertest');
const app = require('../../app');
const cartService = require('../../services/cart.service');
const { signAccessToken } = require('../../utils/jwt');
const { conflict } = require('../../utils/errors');

function makeToken({ sub = 'u1', role = 'user', email = 'user@example.com' } = {}) {
  return signAccessToken({
    _id: sub,
    role,
    email,
  });
}

describe('HTTP /cart', () => {
  const userToken = makeToken({ sub: 'u1', role: 'user', email: 'user@example.com' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /cart/items', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/cart/items').send({ productId: 'p1', qty: 1 });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('returns 400 for invalid qty', async () => {
      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: 'p1', qty: 0 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid cart item payload');
      expect(cartService.addItem).not.toHaveBeenCalled();
    });

    it('returns 200 for valid add', async () => {
      cartService.addItem.mockResolvedValue({
        items: [{ productId: 'p1', name: 'Product 1', price: 10, qty: 1 }],
        total: 10,
      });

      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: 'p1', qty: 1 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        items: [{ productId: 'p1', name: 'Product 1', price: 10, qty: 1 }],
        total: 10,
      });
    });

    it('returns 409 when stock is insufficient', async () => {
      cartService.addItem.mockRejectedValue(conflict('Not enough stock'));

      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: 'p1', qty: 2 });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Not enough stock');
    });
  });

  describe('GET /cart', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/cart');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('returns 200 with cart payload', async () => {
      cartService.getCart.mockResolvedValue({ items: [], total: 0 });

      const res = await request(app).get('/cart').set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ items: [], total: 0 });
      expect(cartService.getCart).toHaveBeenCalledWith('u1');
    });
  });

  describe('DELETE /cart/items/:productId', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).delete('/cart/items/p1');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('returns 200 for remove', async () => {
      cartService.removeItem.mockResolvedValue({ items: [], total: 0 });

      const res = await request(app)
        .delete('/cart/items/p1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ items: [], total: 0 });
      expect(cartService.removeItem).toHaveBeenCalledWith('u1', 'p1');
    });
  });

  describe('POST /cart/checkout', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/cart/checkout');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('returns 200 for successful checkout', async () => {
      cartService.checkout.mockResolvedValue({ ok: true, itemsCount: 2, total: 20 });

      const res = await request(app)
        .post('/cart/checkout')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true, itemsCount: 2, total: 20 });
      expect(cartService.checkout).toHaveBeenCalledWith('u1');
    });

    it('returns 409 when unavailable product exists', async () => {
      cartService.checkout.mockRejectedValue(conflict('Cart contains unavailable product'));

      const res = await request(app)
        .post('/cart/checkout')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Cart contains unavailable product');
    });
  });
});
