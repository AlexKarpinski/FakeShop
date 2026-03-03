const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const AuditLog = require('../models/AuditLog');

async function resetData() {
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  return { ok: true };
}

module.exports = resetData;
