# Fake Shop

Minimal infra + API skeleton for the Fake Shop demo.

## Prerequisites

- Docker (with Docker Compose)

## Run

```bash
docker compose up --build
```

The API will be available at `http://localhost:4000`.

## Health Check

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{"status":"ok"}
```

## Stop

Press `Ctrl+C` in the terminal where Compose is running.

## Environment Variables

The API reads these environment variables:

- `PORT` (default: `4000`)
- `NODE_ENV` (default: `development`)
- `MONGO_URL` (required)
- `JWT_SECRET` (required in production; defaults to `change-me` in development)

A sample env file exists at `apps/api/.env.example`.
