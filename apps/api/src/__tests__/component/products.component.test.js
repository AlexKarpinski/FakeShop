jest.mock('../../services/products.service', () => ({
  listProducts: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

const request = require('supertest');
const app = require('../../app');
const productsService = require('../../services/products.service');
const { notFound } = require('../../utils/errors');
const { makeToken } = require('../helpers/tokens');

describe('component HTTP /products', () => {
  const adminToken = makeToken({ sub: 'a1', role: 'admin', email: 'admin@example.com' });
  const userToken = makeToken({ sub: 'u1', role: 'user', email: 'user@example.com' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /products', () => {
    it('returns 200 with products array', async () => {
      productsService.listProducts.mockResolvedValue([
        { id: 'p1', name: 'Product 1', price: 10, inStock: 5 },
      ]);

      const res = await request(app).get('/products');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 'p1', name: 'Product 1', price: 10, inStock: 5 }]);
      expect(productsService.listProducts).toHaveBeenCalled();
    });

    it('supports query params', async () => {
      productsService.listProducts.mockResolvedValue([]);

      const res = await request(app).get('/products?q=pro&sort=price&order=asc&limit=5&offset=1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
      expect(productsService.listProducts).toHaveBeenCalledWith({
        filter: {
          name: { $regex: 'pro', $options: 'i' },
        },
        sort: {
          price: 1,
          _id: -1,
        },
        limit: 5,
        offset: 1,
      });
    });
  });

  describe('POST /products', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/products').send({
        name: 'P',
        price: 10,
        inStock: 1,
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('returns 403 for non-admin token', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'P', price: 10, inStock: 1 });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    it('returns 201 for admin token', async () => {
      productsService.createProduct.mockResolvedValue({
        id: 'p1',
        name: 'Keyboard',
        price: 100,
        inStock: 10,
      });

      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Keyboard', price: 100, inStock: 10 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: 'p1',
        name: 'Keyboard',
        price: 100,
        inStock: 10,
      });
    });

    it('returns 400 for invalid body', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '', price: -1, inStock: -1 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid product payload');
      expect(productsService.createProduct).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /products/:id', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).patch('/products/p1').send({ name: 'New name' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('returns 403 for non-admin token', async () => {
      const res = await request(app)
        .patch('/products/p1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'New name' });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    it('returns 404 when product is missing', async () => {
      productsService.updateProduct.mockRejectedValue(notFound('Product not found'));

      const res = await request(app)
        .patch('/products/p999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New name' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Product not found');
    });

    it('returns 200 when update succeeds', async () => {
      productsService.updateProduct.mockResolvedValue({
        id: 'p1',
        name: 'Mouse',
        price: 20,
        inStock: 2,
      });

      const res = await request(app)
        .patch('/products/p1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Mouse', price: 20, inStock: 2 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 'p1', name: 'Mouse', price: 20, inStock: 2 });
    });
  });

  describe('DELETE /products/:id', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).delete('/products/p1');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('returns 403 for non-admin token', async () => {
      const res = await request(app)
        .delete('/products/p1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    it('returns 404 when missing', async () => {
      productsService.deleteProduct.mockRejectedValue(notFound('Product not found'));

      const res = await request(app)
        .delete('/products/p404')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Product not found');
    });

    it('returns 204 when deleted', async () => {
      productsService.deleteProduct.mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/products/p1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
    });
  });
});
