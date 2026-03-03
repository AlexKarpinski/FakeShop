const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const cartRoutes = require('./routes/cart.routes');
const testRoutes = require('./routes/test.routes');
const authController = require('./controllers/auth.controller');
const authRequired = require('./middlewares/authRequired');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const asyncHandler = require('./utils/asyncHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.get('/me', authRequired, asyncHandler(authController.me));
app.use('/products', productsRoutes);
app.use('/cart', cartRoutes);

if (config.isTest) {
  app.use('/test', testRoutes);
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
