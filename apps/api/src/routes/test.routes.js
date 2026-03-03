const { Router } = require('express');
const testController = require('../controllers/test.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.post('/reset', asyncHandler(testController.reset));
router.post('/seed', asyncHandler(testController.seed));

module.exports = router;
