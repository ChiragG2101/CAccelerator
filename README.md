# Roles Platform Monorepo

This is a starter monorepo for:

- Frontend: **Next.js (App Router) + TypeScript + Tailwind CSS**
- Backend: **Node.js + TypeScript + Express**
- Database: **PostgreSQL + Prisma ORM**

The profile model is role-driven so each role can have a customized profile layout and styling.

## What's inside

- `apps/web` — Next.js frontend with profile pages
- `apps/api` — Node.js API with role/profile endpoints
- `docker-compose.yml` — local Postgres database

## Quick Start

1) install dependencies

```bash
cd /Users/chirag/roles-platform
pnpm install
```

2) copy env file

```bash
cp .env.example .env
```

3) start Postgres

```bash
pnpm run db:up
```

4) generate prisma client + run migrations + seed

```bash
pnpm --dir apps/api prisma generate
pnpm run db:migrate
pnpm run db:seed
```

5) start both apps

```bash
pnpm run dev
```

- frontend: http://localhost:3000
- backend:  http://localhost:4000

## Notes

- I assumed “0UI” in your request means a utility-first Tailwind component system on top of Tailwind (similar to shadcn-style setup). If you want another specific library, tell me and I’ll wire it in directly.
