const swaggerJsdoc = require('swagger-jsdoc');

const openapiSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fake Shop API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:4000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
          required: ['error'],
        },
        AuthToken: {
          type: 'object',
          properties: {
            token: { type: 'string' },
          },
          required: ['token'],
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            inStock: { type: 'integer' },
          },
          required: ['id', 'name', 'price', 'inStock'],
        },
        CartItem: {
          type: 'object',
          properties: {
            productId: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            qty: { type: 'integer' },
          },
          required: ['productId', 'name', 'price', 'qty'],
        },
        Cart: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/CartItem' },
            },
            total: { type: 'number' },
          },
          required: ['items', 'total'],
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Registered',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthToken' },
                },
              },
            },
            400: { description: 'Validation error' },
            409: {
              description: 'Email already exists',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Logged in',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthToken' },
                },
              },
            },
            400: { description: 'Validation error' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Current user',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      email: { type: 'string' },
                      role: { type: 'string', enum: ['user', 'admin'] },
                    },
                    required: ['email', 'role'],
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'List products with filters and sorting',
          parameters: [
            {
              name: 'q',
              in: 'query',
              schema: { type: 'string' },
              description: 'Case-insensitive partial name search',
            },
            {
              name: 'minPrice',
              in: 'query',
              schema: { type: 'number', minimum: 0 },
            },
            {
              name: 'maxPrice',
              in: 'query',
              schema: { type: 'number', minimum: 0 },
            },
            {
              name: 'inStockMin',
              in: 'query',
              schema: { type: 'integer', minimum: 0 },
            },
            {
              name: 'sort',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['createdAt', 'price', 'name'],
                default: 'createdAt',
              },
            },
            {
              name: 'order',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc',
              },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'integer', minimum: 0, default: 0 },
            },
          ],
          responses: {
            200: {
              description: 'Products list',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Product' },
                  },
                },
              },
            },
            400: { description: 'Invalid query params' },
          },
        },
        post: {
          tags: ['Products'],
          summary: 'Create a product (admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    price: { type: 'number', minimum: 0 },
                    inStock: { type: 'integer', minimum: 0 },
                  },
                  required: ['name', 'price', 'inStock'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Product created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' },
                },
              },
            },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
          },
        },
      },
      '/products/{id}': {
        delete: {
          tags: ['Products'],
          summary: 'Delete a product (admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            204: { description: 'Deleted' },
            400: { description: 'Invalid identifier' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
            404: { description: 'Not found' },
          },
        },
      },
      '/cart': {
        get: {
          tags: ['Cart'],
          summary: 'Get current user cart',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Cart payload',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Cart' },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/cart/items': {
        post: {
          tags: ['Cart'],
          summary: 'Reserve stock and add quantity to cart item',
          description:
            'This endpoint increments quantity by qty (delta add). It does not replace existing qty.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    productId: { type: 'string' },
                    qty: { type: 'integer', minimum: 1 },
                  },
                  required: ['productId', 'qty'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Updated cart',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Cart' },
                },
              },
            },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            404: { description: 'Product not found' },
            409: { description: 'Not enough stock' },
          },
        },
      },
      '/cart/items/{productId}': {
        delete: {
          tags: ['Cart'],
          summary: 'Remove product from cart and release reserved stock',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'productId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Updated cart',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Cart' },
                },
              },
            },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/cart/checkout': {
        post: {
          tags: ['Cart'],
          summary: 'Checkout current cart (does not change stock)',
          description:
            'Stock is reserved during add-to-cart and is not decremented again at checkout.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Checkout summary',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean' },
                      itemsCount: { type: 'integer' },
                      total: { type: 'number' },
                    },
                    required: ['ok', 'itemsCount', 'total'],
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            409: { description: 'Cart contains unavailable product' },
          },
        },
      },
    },
  },
  apis: [],
});

module.exports = openapiSpec;
