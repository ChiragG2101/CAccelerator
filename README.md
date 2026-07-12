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

## Deploy to Vercel (frontend + backend)

This repo is ready for a two-project Vercel setup:

- Project 1: `apps/web` (Next.js frontend)
- Project 2: `apps/api` (Express API on Vercel Serverless Functions)

### 1) Deploy backend (`apps/api`)

In Vercel, create a new project and set Root Directory to `apps/api`.

Environment variables for API project:

- `DUMMY_API_MODE=false`
- `MONGODB_URI=<your_mongodb_connection_string>`
- `CORS_ORIGIN=https://<your-web-project>.vercel.app`
- `OPENAI_API_KEY=<if you use OpenAI-backed endpoints>`
- `OPENAI_MODEL=gpt-4.1-mini` (or your choice)
- `LINKUP_API_KEY=<if you use Linkup endpoints>`
- `LINKUP_BASE_URL=https://api.linkup.so/v1`

The API project includes `apps/api/vercel.json` and `apps/api/api/index.ts` so all routes (like `/health`, `/ingest/profile`, `/recommendations/:userId`) are served by one serverless entrypoint.

### 2) Deploy frontend (`apps/web`)

In Vercel, create a second project and set Root Directory to `apps/web`.

Environment variables for web project:

- `NEXT_PUBLIC_API_URL=https://<your-api-project>.vercel.app`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>`
- `CLERK_SECRET_KEY=<your_clerk_secret_key>`

Then redeploy the web app after the API URL is known.

### 3) Post-deploy smoke checks

- API: `GET https://<your-api-project>.vercel.app/health` should return `{ "ok": true, "service": "api" }`
- Web: open `https://<your-web-project>.vercel.app` and verify onboarding/recommendations flow reaches the API.

## MongoDB deployment recommendation

I recommend MongoDB Atlas for fastest/lowest-risk deployment with Vercel:

1. Create an Atlas cluster (M10+ for production, free/shared tier for demo).
2. Create a database user with least privileges.
3. In Network Access, allow only Vercel egress (preferred) or temporarily `0.0.0.0/0` during setup.
4. Copy the SRV URI into API env var `MONGODB_URI`.
5. Keep `DUMMY_API_MODE=false` in Vercel so API writes user records to MongoDB.

If you want, I can also give you:
- a strict production Atlas security checklist (IP allowlists, private endpoints, alerts), or
- a quick demo setup path you can do in under 10 minutes.
