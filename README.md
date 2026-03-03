# Fake Shop

Demo e-commerce project:

- API: Node.js + Express + MongoDB (Mongoose)
- UI: React + Vite
- OpenAPI/Swagger: [http://localhost:4000/docs](http://localhost:4000/docs)

## Quick Start

1. Copy environment variables for Docker Compose:

```bash
cp .env.example .env
```

2. Start API and MongoDB:

```bash
docker compose up --build
```

3. Check API:

- Health: [http://localhost:4000/health](http://localhost:4000/health)
- Docs: [http://localhost:4000/docs](http://localhost:4000/docs)

4. (Optional) Start UI:

```bash
cd apps/ui
npm i
npm run dev
```

UI: [http://localhost:5173](http://localhost:5173)

## Run API Locally (Without Docker)

```bash
cd apps/api
cp .env.example .env
npm i
npm run dev
```

## Project Structure

```text
/
  apps/
    api/
      src/
        routes/
        controllers/
        services/
        models/
        middlewares/
        utils/
        docs/
        seed/
    ui/
      src/
        pages/
        auth/
        api/
        test/
```

## API Layers

- `routes` — route definitions and middleware chains.
- `controllers` — thin layer: input validation/parsing, service calls, HTTP responses.
- `services` — business logic.
- `models` — Mongoose schemas and collection operations.
- `middlewares` / `utils` — reusable cross-cutting helpers.

## Tests & Quality Gates

From the repository root:

```bash
npm ci
npm run lint
npm run test:unit
npm run coverage
```

- API unit/component tests: Jest + supertest with mocked services (`jest.mock`), no real MongoDB.
- UI unit tests: Vitest + Testing Library.
- API coverage excludes `src/services/**` because services are mocked in endpoint tests.

Coverage reports:

- `apps/api/coverage/lcov-report/index.html`
- `apps/ui/coverage/lcov-report/index.html`

## GitHub Secrets (Required)

Add these repository secrets for CI:

1. `MONGO_URL`
2. `JWT_SECRET`
