const Product = require('../models/Product');

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toProductResponse(product) {
  return {
    id: String(product._id),
    name: product.name,
    price: product.price,
    inStock: product.inStock,
  };
}

async function listProducts(options = {}) {
  const {
    filter = {},
    sort = { createdAt: -1, _id: -1 },
    limit = 50,
    offset = 0,
  } = options;

  const products = await Product.find(filter)
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .lean();
  return products.map(toProductResponse);
}

async function createProduct({ name, price, inStock }) {
  const product = await Product.create({ name, price, inStock });
  return toProductResponse(product);
}

async function deleteProduct(productId) {
  const deleted = await Product.findByIdAndDelete(productId).lean();

  if (!deleted) {
    throw createHttpError(404, 'Product not found');
  }
}

module.exports = {
  listProducts,
  createProduct,
  deleteProduct,
};
