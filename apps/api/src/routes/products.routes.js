const { Router } = require('express');
const productsController = require('../controllers/products.controller');
const authRequired = require('../middlewares/authRequired');
const adminRequired = require('../middlewares/adminRequired');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.get('/', asyncHandler(productsController.listProducts));
router.post('/', authRequired, adminRequired, asyncHandler(productsController.createProduct));
router.patch('/:id', authRequired, adminRequired, asyncHandler(productsController.updateProduct));
router.delete('/:id', authRequired, adminRequired, asyncHandler(productsController.deleteProduct));

module.exports = router;
