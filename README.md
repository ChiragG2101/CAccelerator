# Roles Platform Monorepo

This is a starter monorepo for:

- Frontend: **Next.js (App Router) + TypeScript + Tailwind CSS**
- Backend: **Node.js + TypeScript + Express + Strands Agents SDK**
- LLM provider: **OpenAI**
- Database: **MongoDB + Mongoose ODM**

## What's inside

- `apps/web` — Next.js frontend with profile pages
- `apps/api` — Express API foundation with MongoDB and Strands/OpenAI configuration
- `docker-compose.yml` — local MongoDB database

## Quick Start

1) install dependencies

```bash
cd /Users/adityagupta/Documents/CAccelerator
pnpm install
```

2) copy env file

```bash
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
```

3) Add your OpenAI API key to `.env`, then set Clerk keys in `apps/web/.env.local`

Required Clerk values:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Then start MongoDB

```bash
pnpm run db:up
```

4) start both apps

```bash
pnpm run dev
```

- frontend: http://localhost:3000
- backend:  http://localhost:4000

The API currently exposes only `GET /health`. The `apps/api/src/agents` folder contains the generic Strands/OpenAI setup; business agents and routes will be added later.

## Notes

- I assumed “0UI” in your request means a utility-first Tailwind component system on top of Tailwind (similar to shadcn-style setup). If you want another specific library, tell me and I’ll wire it in directly.
