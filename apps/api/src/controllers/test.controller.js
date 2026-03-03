const seedData = require('../seed/seed');
const resetData = require('../seed/reset');

async function reset(req, res) {
  const result = await resetData();
  return res.status(200).json(result);
}

async function seed(req, res) {
  const result = await seedData(req.body || {});
  return res.status(200).json(result);
}

module.exports = {
  reset,
  seed,
};
