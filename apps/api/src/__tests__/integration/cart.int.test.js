const request = require('supertest');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Cart = require('../../models/Cart');
const AuditLog = require('../../models/AuditLog');
const { hashPassword } = require('../../utils/hash');
const { makeToken } = require('../helpers/tokens');

describe('integration cart reservation and checkout', () => {
  let app;

  beforeAll(() => {
    app = require('../../app');
  });

  async function createUser() {
    return User.create({
      email: 'cart-int@example.com',
      role: 'user',
      passwordHash: await hashPassword('secret123'),
    });
  }

  it('reserves stock on add, increments qty on repeated add, and releases on remove', async () => {
    const user = await createUser();
    const token = makeToken({
      sub: String(user._id),
      role: user.role,
      email: user.email,
    });

    const product = await Product.create({
      name: 'Stocked Product',
      price: 10,
      inStock: 2,
    });

    const firstAdd = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: String(product._id), qty: 1 });
    expect(firstAdd.status).toBe(200);

    const afterFirstAdd = await Product.findById(product._id).lean();
    expect(afterFirstAdd.inStock).toBe(1);

    const secondAdd = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: String(product._id), qty: 1 });
    expect(secondAdd.status).toBe(200);
    expect(secondAdd.body.items[0].qty).toBe(2);

    const afterSecondAdd = await Product.findById(product._id).lean();
    expect(afterSecondAdd.inStock).toBe(0);

    const removeRes = await request(app)
      .delete(`/cart/items/${product._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(removeRes.status).toBe(200);
    expect(removeRes.body).toEqual({ items: [], total: 0 });

    const afterRemove = await Product.findById(product._id).lean();
    expect(afterRemove.inStock).toBe(2);
  });

  it('checkout empties cart, writes audit log, and does not decrement stock again', async () => {
    const user = await createUser();
    const token = makeToken({
      sub: String(user._id),
      role: user.role,
      email: user.email,
    });

    const product = await Product.create({
      name: 'Checkout Product',
      price: 12,
      inStock: 2,
    });

    const addRes = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: String(product._id), qty: 1 });
    expect(addRes.status).toBe(200);

    const stockAfterAdd = await Product.findById(product._id).lean();
    expect(stockAfterAdd.inStock).toBe(1);

    const checkoutRes = await request(app)
      .post('/cart/checkout')
      .set('Authorization', `Bearer ${token}`);
    expect(checkoutRes.status).toBe(200);
    expect(checkoutRes.body).toEqual({ ok: true, itemsCount: 1, total: 12 });

    const cart = await Cart.findOne({ userId: user._id }).lean();
    expect(cart.items).toEqual([]);

    const audit = await AuditLog.findOne({ userId: user._id, action: 'CHECKOUT' }).lean();
    expect(audit).toBeTruthy();
    expect(audit.meta).toMatchObject({ itemsCount: 1, total: 12 });

    const stockAfterCheckout = await Product.findById(product._id).lean();
    expect(stockAfterCheckout.inStock).toBe(1);
  });
});
