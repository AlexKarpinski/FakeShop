# Fake Shop

Demo e-commerce project:

- API: Node.js + Express + MongoDB (Mongoose)
- UI: React + Vite
- OpenAPI/Swagger: [http://localhost:4000/docs](http://localhost:4000/docs)

## Quick Start

1. Start API and MongoDB:

```bash
docker compose up --build
```

2. Check API:

- Health: [http://localhost:4000/health](http://localhost:4000/health)
- Docs: [http://localhost:4000/docs](http://localhost:4000/docs)

3. (Optional) Start UI:

```bash
cd apps/ui
npm i
npm run dev
```

UI: [http://localhost:5173](http://localhost:5173)

## Configuration

- Root [`.env.example`](/Users/alexkarpinski/Documents/FakeShop/.env.example) documents all API and UI variables.
- API gets runtime environment from `docker-compose.yml`; you usually do not need a local `.env` file for API.
- UI uses `VITE_API_URL`; set it in [apps/ui/.env.example](/Users/alexkarpinski/Documents/FakeShop/apps/ui/.env.example) (copy to `apps/ui/.env`) or pass it as an environment variable.

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
