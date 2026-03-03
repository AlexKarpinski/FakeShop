const productsService = require('../services/products.service');
const parseProductsQuery = require('../utils/productsQuery');

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
  const query = parseProductsQuery(req.query);
  const products = await productsService.listProducts(query);
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

async function updateProduct(req, res) {
  const { id } = req.params;

  if (!isNonEmptyString(id)) {
    return res.status(400).json({ error: 'Product id is required' });
  }

  const { name, price, inStock } = req.body || {};
  const patch = {};

  if (name !== undefined) {
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ error: 'Invalid product payload' });
    }
    patch.name = name.trim();
  }

  if (price !== undefined) {
    if (!isValidPrice(price)) {
      return res.status(400).json({ error: 'Invalid product payload' });
    }
    patch.price = price;
  }

  if (inStock !== undefined) {
    if (!isValidStock(inStock)) {
      return res.status(400).json({ error: 'Invalid product payload' });
    }
    patch.inStock = inStock;
  }

  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ error: 'At least one field (name, price, inStock) is required' });
  }

  const product = await productsService.updateProduct(id, patch);
  return res.status(200).json(product);
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
  updateProduct,
  deleteProduct,
};
