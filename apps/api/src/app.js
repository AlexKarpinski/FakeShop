const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/env');
const openapiSpec = require('./docs/openapi');
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

app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: false,
  })
);
app.use(express.json());

app.use('/health', healthRoutes);
app.get('/openapi.json', (req, res) => {
  res.status(200).json(openapiSpec);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
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
