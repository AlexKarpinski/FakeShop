const productsService = require('../services/products.service');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidPrice(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isValidStock(value) {
  return Number.isInteger(value) && value >= 0;
}

async function listProducts(req, res) {
  const products = await productsService.listProducts();
  return res.status(200).json(products);
}

async function createProduct(req, res) {
  const { name, price, inStock } = req.body || {};

  if (!isNonEmptyString(name) || !isValidPrice(price) || !isValidStock(inStock)) {
    return res.status(400).json({ error: 'Invalid product payload' });
  }

  const product = await productsService.createProduct({
    name: name.trim(),
    price,
    inStock,
  });

  return res.status(201).json(product);
}

async function deleteProduct(req, res) {
  const { id } = req.params;

  if (!isNonEmptyString(id)) {
    return res.status(400).json({ error: 'Product id is required' });
  }

  await productsService.deleteProduct(id);
  return res.status(204).send();
}

module.exports = {
  listProducts,
  createProduct,
  deleteProduct,
};
