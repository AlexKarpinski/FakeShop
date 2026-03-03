const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { logCheckout } = require('./audit.service');

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function toCartResponse(cart) {
  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    return { items: [], total: 0 };
  }

  const productIds = cart.items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productsById = new Map(products.map((product) => [String(product._id), product]));

  const items = cart.items.reduce((acc, item) => {
    const product = productsById.get(String(item.productId));

    if (!product) {
      return acc;
    }

    acc.push({
      productId: String(product._id),
      name: product.name,
      price: product.price,
      qty: item.qty,
    });

    return acc;
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return {
    items,
    total,
  };
}

async function getCart(userId) {
  const cart = await Cart.findOne({ userId });
  return toCartResponse(cart);
}

async function addItem(userId, { productId, qty }) {
  const product = await Product.findById(productId).lean();

  if (!product) {
    throw createHttpError(404, 'Product not found');
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const existingItem = cart.items.find((item) => String(item.productId) === String(product._id));

  if (existingItem) {
    existingItem.qty = qty;
  } else {
    cart.items.push({ productId: product._id, qty });
  }

  cart.updatedAt = new Date();
  await cart.save();

  return toCartResponse(cart);
}

async function removeItem(userId, productId) {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return { items: [], total: 0 };
  }

  cart.items = cart.items.filter((item) => String(item.productId) !== String(productId));
  cart.updatedAt = new Date();
  await cart.save();

  return toCartResponse(cart);
}

async function checkout(userId) {
  const cart = await Cart.findOne({ userId });
  const cartResponse = await toCartResponse(cart);

  const itemsCount = cartResponse.items.reduce((sum, item) => sum + item.qty, 0);
  const total = cartResponse.total;

  await logCheckout({ userId, itemsCount, total });

  if (cart) {
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();
  }

  return {
    ok: true,
    itemsCount,
    total,
  };
}

module.exports = {
  addItem,
  getCart,
  removeItem,
  checkout,
};
