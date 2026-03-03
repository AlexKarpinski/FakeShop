const AuditLog = require('../models/AuditLog');

async function logCheckout({ userId, itemsCount, total }) {
  await AuditLog.create({
    action: 'CHECKOUT',
    userId,
    meta: {
      itemsCount,
      total,
    },
  });
}

module.exports = {
  logCheckout,
};
