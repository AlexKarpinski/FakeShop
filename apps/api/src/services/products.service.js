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

async function listProducts() {
  const products = await Product.find().sort({ createdAt: 1 }).lean();
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
