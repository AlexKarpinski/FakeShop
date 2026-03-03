const { Router } = require('express');
const cartController = require('../controllers/cart.controller');
const authRequired = require('../middlewares/authRequired');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.use(authRequired);

router.get('/', asyncHandler(cartController.getCart));
router.post('/items', asyncHandler(cartController.addItem));
router.delete('/items/:productId', asyncHandler(cartController.removeItem));
router.post('/checkout', asyncHandler(cartController.checkout));

module.exports = router;
