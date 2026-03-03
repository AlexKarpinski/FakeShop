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
