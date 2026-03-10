## Peerly Backend

Backend API for Peerly, built with **NestJS** and **Prisma** (PostgreSQL).

## Requirements

- **Node.js** (recommended: 18+)
- **PostgreSQL**
  - Either installed locally, or run via Docker

## Configuration

The app loads environment variables from `.env` (via `dotenv/config` in `src/main.ts`).

Required variables:

- **`DATABASE_URL`**: PostgreSQL connection string
- **`PORT`** (optional): API port (defaults to `3000`)

Current `.env` ships with:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/peerly?schema=public"
```

## Run locally (Windows / PowerShell)

Install dependencies:

```powershell
npm install
```

Start PostgreSQL (Docker example; matches `.env` port `5433`):

```powershell
docker run --name peerly-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=peerly `
  -p 5433:5432 `
  -d postgres:16
```

Enable UUID generation (required by the Prisma schema defaults that call `uuid_generate_v4()`):

```powershell
docker exec -it peerly-postgres psql -U postgres -d peerly -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```

Generate Prisma client:

```powershell
npx prisma generate
```

Sync database schema (choose one):

- **Option A (fastest for local/dev)**: push schema

```powershell
npx prisma db push
```

- **Option B (migration-based)**: create & apply an initial migration

```powershell
npx prisma migrate dev --name init
```

Run the API (dev watch mode):

```powershell
npm run start:dev
```

API will be available at `http://localhost:3000` (or `http://localhost:$env:PORT` if you set `PORT`).

## Production

```powershell
npm run build
npm run start:prod
```

## Useful commands

```bash
npm run start       # start
npm run start:dev   # start with file watch
npm run build       # build to dist/
npm run start:prod  # run dist/main
npm run lint        # eslint --fix
npm run format      # prettier
npm run test        # unit tests
```