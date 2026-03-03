# Fake Shop

Demo-проект интернет-магазина:

- API: Node.js + Express + MongoDB (Mongoose)
- UI: React + Vite
- OpenAPI/Swagger: [http://localhost:4000/docs](http://localhost:4000/docs)

## Quick Start

1. Скопируйте переменные окружения для Docker Compose:

```bash
cp .env.example .env
```

2. Запустите API и MongoDB:

```bash
docker compose up --build
```

3. Проверьте API:

- Health: [http://localhost:4000/health](http://localhost:4000/health)
- Docs: [http://localhost:4000/docs](http://localhost:4000/docs)

4. (Опционально) Запустите UI:

```bash
cd apps/ui
npm i
npm run dev
```

UI: [http://localhost:5173](http://localhost:5173)

## Локальный запуск API без Docker

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

- `routes` — только маршрутизация и middleware-цепочки.
- `controllers` — тонкий слой: валидация/парсинг + вызов сервисов + HTTP-ответ.
- `services` — бизнес-логика.
- `models` — Mongoose-схемы и работа с коллекциями.
- `middlewares`/`utils` — переиспользуемые компоненты.

## Tests & Quality Gates

Из корня репозитория:

```bash
npm ci
npm run lint
npm run test:unit
npm run coverage
```

- API unit/component tests: Jest + supertest, сервисы мокируются (`jest.mock`), без реальной MongoDB.
- UI unit tests: Vitest + Testing Library.
- API coverage excludes `src/services/**` because those modules are mocked in endpoint tests.

Coverage reports:

- `apps/api/coverage/lcov-report/index.html`
- `apps/ui/coverage/lcov-report/index.html`
