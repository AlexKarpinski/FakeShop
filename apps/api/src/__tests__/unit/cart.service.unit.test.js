jest.mock('../../models/Cart', () => {
  const CartModel = jest.fn();
  CartModel.findOne = jest.fn();
  return CartModel;
});

jest.mock('../../models/Product', () => ({
  updateOne: jest.fn(),
  exists: jest.fn(),
  find: jest.fn(),
}));

jest.mock('../../services/audit.service', () => ({
  logCheckout: jest.fn(),
}));

const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const { logCheckout } = require('../../services/audit.service');
const cartService = require('../../services/cart.service');

function mockLean(value) {
  return {
    lean: jest.fn().mockResolvedValue(value),
  };
}

describe('services/cart.service', () => {
  const userId = '507f191e810c19729de860ea';
  const productId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('addItem reserves stock and increments existing item qty', async () => {
    const cart = {
      userId,
      items: [{ productId, qty: 1 }],
      save: jest.fn().mockResolvedValue(undefined),
    };

    Product.updateOne.mockResolvedValueOnce({ modifiedCount: 1 });
    Cart.findOne.mockResolvedValue(cart);
    Product.find.mockReturnValue(
      mockLean([
        {
          _id: productId,
          name: 'Product 1',
          price: 10,
        },
      ])
    );

    const result = await cartService.addItem(userId, { productId, qty: 2 });

    expect(Product.updateOne).toHaveBeenNthCalledWith(
      1,
      { _id: productId, inStock: { $gte: 2 } },
      { $inc: { inStock: -2 } }
    );
    expect(cart.items).toEqual([{ productId, qty: 3 }]);
    expect(cart.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      items: [{ productId, name: 'Product 1', price: 10, qty: 3 }],
      total: 30,
    });
  });

  it('addItem returns conflict when stock is insufficient', async () => {
    Product.updateOne.mockResolvedValueOnce({ modifiedCount: 0 });
    Product.exists.mockResolvedValueOnce({ _id: productId });

    await expect(
      cartService.addItem(userId, {
        productId,
        qty: 1,
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'Not enough stock',
    });
  });

  it('removeItem releases stock for removed quantity', async () => {
    const cart = {
      userId,
      items: [{ productId, qty: 2 }],
      save: jest.fn().mockResolvedValue(undefined),
    };

    Cart.findOne.mockResolvedValue(cart);
    Product.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const result = await cartService.removeItem(userId, productId);

    expect(Product.updateOne).toHaveBeenCalledWith(
      { _id: productId },
      { $inc: { inStock: 2 } }
    );
    expect(cart.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ items: [], total: 0 });
  });

  it('checkout clears cart and writes audit without changing stock again', async () => {
    const cart = {
      userId,
      items: [{ productId, qty: 2 }],
      save: jest.fn().mockResolvedValue(undefined),
    };

    Cart.findOne.mockResolvedValue(cart);
    Product.find.mockReturnValue(
      mockLean([
        {
          _id: productId,
          name: 'Product 1',
          price: 15,
        },
      ])
    );

    const result = await cartService.checkout(userId);

    expect(logCheckout).toHaveBeenCalledWith({
      userId,
      itemsCount: 2,
      total: 30,
    });
    expect(Product.updateOne).not.toHaveBeenCalled();
    expect(cart.items).toEqual([]);
    expect(cart.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: true, itemsCount: 2, total: 30 });
  });
});
