const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authRequired = require('../middlewares/authRequired');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.get('/me', authRequired, asyncHandler(authController.me));

module.exports = router;
