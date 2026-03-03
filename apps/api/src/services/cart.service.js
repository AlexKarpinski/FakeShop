const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { logCheckout } = require('./audit.service');
const { notFound, conflict, HttpError } = require('../utils/errors');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function mergeItems(items = []) {
  const merged = new Map();

  for (const item of items) {
    const productId = String(item.productId);
    const qty = Number(item.qty) || 0;

    if (!productId || qty <= 0) {
      continue;
    }

    merged.set(productId, (merged.get(productId) || 0) + qty);
  }

  return Array.from(merged.entries()).map(([productId, qty]) => ({ productId, qty }));
}

function applyMergedItems(cart) {
  const mergedItems = mergeItems(cart.items);
  cart.items = mergedItems.map((item) => ({
    productId: item.productId,
    qty: item.qty,
  }));
}

async function reserveStock(productId, qty) {
  if (!isValidObjectId(productId)) {
    throw notFound('Product not found');
  }

  const reserveResult = await Product.updateOne(
    {
      _id: productId,
      inStock: { $gte: qty },
    },
    {
      $inc: { inStock: -qty },
    }
  );

  if (reserveResult.modifiedCount === 1) {
    return;
  }

  const productExists = await Product.exists({ _id: productId });

  if (!productExists) {
    throw notFound('Product not found');
  }

  throw conflict('Not enough stock');
}

async function releaseStock(productId, qty) {
  if (!isValidObjectId(productId) || !Number.isInteger(qty) || qty <= 0) {
    return;
  }

  try {
    await Product.updateOne(
      { _id: productId },
      {
        $inc: { inStock: qty },
      }
    );
  } catch (error) {
    console.error('Failed to release reserved stock:', error.message);
  }
}

async function toCartComputation(cart) {
  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    return { items: [], total: 0, missingProducts: 0 };
  }

  const mergedItems = mergeItems(cart.items);
  const productIds = mergedItems.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productsById = new Map(products.map((product) => [String(product._id), product]));

  let missingProducts = 0;

  const items = mergedItems.reduce((acc, item) => {
    const product = productsById.get(item.productId);

    if (!product) {
      missingProducts += 1;
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
    missingProducts,
  };
}

async function getCart(userId) {
  const cart = await Cart.findOne({ userId });
  const computed = await toCartComputation(cart);

  return {
    items: computed.items,
    total: computed.total,
  };
}

async function addItem(userId, { productId, qty }) {
  await reserveStock(productId, qty);

  let cart;

  try {
    cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    applyMergedItems(cart);

    const existingItem = cart.items.find((item) => String(item.productId) === String(productId));

    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.items.push({ productId, qty });
    }

    cart.updatedAt = new Date();
    await cart.save();
  } catch (error) {
    await releaseStock(productId, qty);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to update cart');
  }

  const computed = await toCartComputation(cart);

  return {
    items: computed.items,
    total: computed.total,
  };
}

async function removeItem(userId, productId) {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return { items: [], total: 0 };
  }

  applyMergedItems(cart);

  const index = cart.items.findIndex((item) => String(item.productId) === String(productId));

  if (index === -1) {
    const computed = await toCartComputation(cart);
    return {
      items: computed.items,
      total: computed.total,
    };
  }

  const [removedItem] = cart.items.splice(index, 1);

  cart.updatedAt = new Date();
  await cart.save();

  await releaseStock(removedItem.productId, removedItem.qty);

  const computed = await toCartComputation(cart);

  return {
    items: computed.items,
    total: computed.total,
  };
}

async function checkout(userId) {
  const cart = await Cart.findOne({ userId });

  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    await logCheckout({ userId, itemsCount: 0, total: 0 });

    return {
      ok: true,
      itemsCount: 0,
      total: 0,
    };
  }

  applyMergedItems(cart);

  const computed = await toCartComputation(cart);

  if (computed.missingProducts > 0) {
    throw conflict('Cart contains unavailable product');
  }

  const itemsCount = computed.items.reduce((sum, item) => sum + item.qty, 0);
  const total = computed.total;

  await logCheckout({ userId, itemsCount, total });

  cart.items = [];
  cart.updatedAt = new Date();
  await cart.save();

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
