# Fake Shop

Express + MongoDB demo API with a thin React + Vite UI.

## Prerequisites

- Docker (with Docker Compose)
- Node.js 20+ (for running UI locally)

## Run API

```bash
docker compose up --build
```

API base URL: `http://localhost:4000`

## Health Check

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{"status":"ok"}
```

## API Docs

- Swagger UI: [http://localhost:4000/docs](http://localhost:4000/docs)
- OpenAPI JSON: [http://localhost:4000/openapi.json](http://localhost:4000/openapi.json)

## Run UI (Vite)

Keep the API running on port `4000` (using `docker compose up --build`), then in a second terminal:

```bash
cd apps/ui
npm i
npm run dev
```

UI default URL: `http://localhost:5173`

UI API URL is configured by `VITE_API_URL`.
A sample file is available at `apps/ui/.env.example`.

## Stop

Press `Ctrl+C` in the terminal where Compose or Vite is running.

## Environment Variables (API)

The API reads these environment variables:

- `PORT` (default: `4000`)
- `NODE_ENV` (default: `development`)
- `MONGO_URL` (required)
- `JWT_SECRET` (required in production; defaults to `change-me` in development)

A sample env file exists at `apps/api/.env.example`.

## API Examples

### Register and login

```bash
curl -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"user1@example.com","password":"secret12"}'

curl -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user1@example.com","password":"secret12"}'
```

Store user token (requires `jq`):

```bash
USER_TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user1@example.com","password":"secret12"}' | jq -r '.token')
```

### Admin login and create product

First seed test users/products in test mode (see `Test Helpers` section), or create an admin user directly in DB.

```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq -r '.token')

curl -X POST http://localhost:4000/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Keyboard","price":99.99,"inStock":12}'
```

Update product (admin):

```bash
curl -X PATCH http://localhost:4000/products/<PRODUCT_ID> \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Keyboard v2","price":109.99,"inStock":8}'
```

Delete product (admin):

```bash
curl -X DELETE http://localhost:4000/products/<PRODUCT_ID> \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### User login, add to cart, checkout

```bash
USER_TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"user123"}' | jq -r '.token')

curl http://localhost:4000/products

curl -X POST http://localhost:4000/cart/items \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"productId":"<PRODUCT_ID>","qty":2}'

curl -X GET http://localhost:4000/cart \
  -H "Authorization: Bearer $USER_TOKEN"

curl -X POST http://localhost:4000/cart/checkout \
  -H "Authorization: Bearer $USER_TOKEN"
```

Add the same item twice (qty increments, not replaces):

```bash
curl -X POST http://localhost:4000/cart/items \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"productId":"<PRODUCT_ID>","qty":1}'

curl -X POST http://localhost:4000/cart/items \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"productId":"<PRODUCT_ID>","qty":1}'
```

If stock is insufficient, add-to-cart returns:

```json
{"error":"Not enough stock"}
```

with status `409`.

Cart reservation model:

- Stock is reserved when calling `POST /cart/items` (product `inStock` decreases immediately).
- Removing an item with `DELETE /cart/items/:productId` releases reserved stock.
- Checkout clears cart and writes audit log; stock is not changed again at checkout.
- `GET /cart` omits deleted/unavailable products from the response items list.
- If checkout finds unavailable products in cart, it returns `409` and does not clear cart.

### Product discovery queries

Search by name:

```bash
curl "http://localhost:4000/products?q=Product"
```

Filter by price range:

```bash
curl "http://localhost:4000/products?minPrice=20&maxPrice=80"
```

Only in-stock products:

```bash
curl "http://localhost:4000/products?inStockMin=1"
```

Sort by price ascending:

```bash
curl "http://localhost:4000/products?sort=price&order=asc"
```

## Admin UI

- Login as `admin@example.com / admin123`
- Open [http://localhost:5173/admin/products](http://localhost:5173/admin/products)
- Admins can create, update, and delete products from this page.

## Signup

- UI route: [http://localhost:5173/signup](http://localhost:5173/signup)
- Login page includes a link to create a new account.

Register with curl:

```bash
curl -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"newuser@example.com","password":"secret12"}'
```

## Test Helpers (`/test/*`)

`/test` routes are mounted only when `NODE_ENV=test`.

- In non-test modes (like default Compose development mode), `/test/*` returns 404.
- In test mode, available endpoints are:
  - `POST /test/reset`
  - `POST /test/seed`

Example run in test mode:

```bash
cd apps/api
MONGO_URL=mongodb://localhost:27017/fakeshop JWT_SECRET=change-me NODE_ENV=test PORT=4000 npm start
```

Then call helpers:

```bash
curl -X POST http://localhost:4000/test/reset
curl -X POST http://localhost:4000/test/seed
```

Configurable seed options (`reset` must be `true`):

```bash
curl -X POST http://localhost:4000/test/seed \
  -H 'Content-Type: application/json' \
  -d '{"productsCount":5,"stock":1,"priceStart":5,"priceStep":2,"reset":true}'
```
