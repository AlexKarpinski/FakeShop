const cartService = require('../services/cart.service');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidQty(value) {
  return Number.isInteger(value) && value >= 1;
}

async function getCart(req, res) {
  const cart = await cartService.getCart(req.user.id);
  return res.status(200).json(cart);
}

async function addItem(req, res) {
  const { productId, qty } = req.body || {};

  if (!isNonEmptyString(productId) || !isValidQty(qty)) {
    return res.status(400).json({ error: 'Invalid cart item payload' });
  }

  const cart = await cartService.addItem(req.user.id, { productId: productId.trim(), qty });
  return res.status(200).json(cart);
}

async function removeItem(req, res) {
  const { productId } = req.params;

  if (!isNonEmptyString(productId)) {
    return res.status(400).json({ error: 'Product id is required' });
  }

  const cart = await cartService.removeItem(req.user.id, productId.trim());
  return res.status(200).json(cart);
}

async function checkout(req, res) {
  const result = await cartService.checkout(req.user.id);
  return res.status(200).json(result);
}

module.exports = {
  getCart,
  addItem,
  removeItem,
  checkout,
};
