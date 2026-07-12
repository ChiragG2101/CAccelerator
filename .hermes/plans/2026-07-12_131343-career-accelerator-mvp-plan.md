# Career Accelerator MVP (3–4 Hour Pilot) Implementation Plan

> For Hermes: this is a planning-only artifact for rapid team execution in the current roles-platform monorepo.

Goal: Build a pilot-ready flow where a user signs in, uploads resume or LinkedIn URL, gets relevant jobs, and generates job-specific resume tailoring suggestions in one session.

Architecture: Reuse existing Next.js + Express + Prisma foundations. Extend current User/Profile model and add lightweight job/recommendation/tailoring endpoints in API. Keep AI + job sourcing pluggable with fallbacks (mock + curated jobs) so demo never blocks on external API reliability.

Tech stack: Next.js 14 App Router, Tailwind, Express, Prisma/Postgres, zod, optional LLM API (OpenAI/Claude), optional JSearch/Adzuna API.

---

## 1) Fast MVP Scope (strict)

In scope for 3–4h:
1. Sign-in (basic, minimal friction for pilot)
2. Profile ingest:
   - Resume text upload (PDF/DOCX optional; plain text fallback required)
   - LinkedIn public URL input (scrape optional; manual summary fallback required)
3. Profile parser:
   - Extract title, years exp (approx), skills, preferred roles/locations
4. Job recommendations:
   - Show 10–20 ranked jobs from one source (API or seeded table)
5. Per-job “Tailor Resume”:
   - Generate job-specific resume bullets + summary + keyword gaps
6. Track pilot metrics:
   - upload success, recommendation clicks, tailor generation success

Out of scope for MVP:
- Full ATS autofill / one-click external apply automation
- Deep LinkedIn OAuth ingestion with private profile fields
- Production-grade anti-fraud, billing, full admin panel

---

## 2) What exists in this repo now (confirmed)

- Monorepo scripts in `package.json` for `dev`, `build`, `lint`
- Frontend app in `apps/web` with Next.js App Router
- Backend app in `apps/api` with Express endpoints in `apps/api/src/index.ts`
- Prisma schema in `apps/api/prisma/schema.prisma`
- Existing role/profile data model already supports `customData` JSON in `Profile`

Leverage this instead of building new services.

---

## 3) User experience (pilot flow)

### Candidate flow (happy path)
1. Landing page: “Get matched jobs + tailored resume in minutes”
2. Login/sign-up (email or Google if already available)
3. Onboarding form:
   - Upload resume text/PDF
   - Paste LinkedIn URL (optional)
   - Target role + location + work mode
4. Click “Analyze profile”
5. See ranked jobs list with:
   - Match score
   - Why match (skills overlap)
   - Missing keywords
6. Click job card:
   - Buttons: “Tailor Resume”, “Apply”
7. Tailor result view:
   - Tailored headline
   - 5–8 tailored bullets
   - ATS keywords to add
   - Copy/download text

### Pilot-safe fallback UX
If scraping/API fails:
- Show “Use manual summary” textarea and continue
- Show seeded jobs from DB
- Show deterministic template-based tailoring (no LLM)

---

## 4) Data model changes (minimal)

Prefer adding small focused tables; keep profile JSON for parsed payload.

Modify: `apps/api/prisma/schema.prisma`

Add models:
- `JobOpening`
  - `id`, `source`, `externalId`, `title`, `company`, `location`, `mode`, `description`, `applyUrl`, `createdAt`
- `Recommendation`
  - `id`, `userId`, `jobId`, `score` (0–100), `reasoning` (JSON), `createdAt`
- `TailoredResume`
  - `id`, `userId`, `jobId`, `baseResumeText`, `tailoredText`, `keywordGaps` (JSON), `createdAt`

Extend `Profile.customData` usage to include:
- `parsed`: `{ title, years, skills[], industries[], preferredRoles[], preferredLocations[] }`
- `rawResumeText`, `linkedinUrl`

Run migration + generate client.

---

## 5) API design (Express)

Modify: `apps/api/src/index.ts` (or split routes if time allows)

### Endpoints for MVP
1. `POST /ingest/profile`
   - Input: `{ userId, resumeText?, linkedinUrl?, manualSummary?, targetRole?, location? }`
   - Output: parsed profile payload + persisted profile JSON

2. `POST /jobs/fetch`
   - Input: `{ query, location, limit }`
   - Behavior: fetch from external jobs API OR fallback seeded jobs
   - Output: normalized jobs

3. `POST /recommendations/generate`
   - Input: `{ userId }`
   - Behavior: score user profile vs jobs (keyword overlap + title similarity)
   - Output: top recommendations

4. `GET /recommendations/:userId`
   - Output: ranked recommendations joined with job details

5. `POST /tailor-resume`
   - Input: `{ userId, jobId }`
   - Behavior: LLM template prompt OR heuristic template fallback
   - Output: `{ tailoredText, keywordGaps, matchImprovements }`

6. `POST /events`
   - Input: `{ userId, type, metadata }`
   - Behavior: append simple analytics event row/log

Validation: zod for every route.

---

## 6) Frontend plan (Next.js + Tailwind)

### New/updated pages
- Modify `apps/web/src/app/page.tsx`
  - Change from profile directory to product landing + CTA

- Create `apps/web/src/app/onboarding/page.tsx`
  - Form for resume/linkedin/target role/location

- Create `apps/web/src/app/recommendations/page.tsx`
  - Recommendation list, sorting, filters

- Create `apps/web/src/app/recommendations/[jobId]/page.tsx`
  - Job details + Tailor Resume action

### Components
Create under `apps/web/src/components/`:
- `ResumeUpload.tsx`
- `LinkedInInput.tsx`
- `RecommendationCard.tsx`
- `TailorDrawer.tsx` (or panel)
- `MatchReasons.tsx`

### Client-side API helpers
Create `apps/web/src/lib/api.ts` for typed fetch wrappers.
Update `apps/web/src/lib/types.ts` with new interfaces.

---

## 7) Ranking and tailoring logic (simple but effective)

### Recommendation score (deterministic, fast)
Score =
- 40% skill overlap (Jaccard)
- 25% title similarity (token overlap)
- 20% location/mode compatibility
- 15% years-of-experience fit

Expose “why this match” from components above.

### Tailoring strategy
If LLM available:
- Prompt with user resume + selected job description
- Return strict JSON with fields:
  - `headline`
  - `summary`
  - `bullets[]`
  - `keywordsToAdd[]`

If LLM unavailable:
- Rule-based rewrite:
  - prioritize matched keywords
  - map user bullets to required skills
  - output structured text template

---

## 8) Team split for 3 people (parallel execution)

Engineer A (Backend + data)
- Prisma models + migration
- `POST /ingest/profile`
- `POST /recommendations/generate` + `GET /recommendations/:userId`
- `POST /tailor-resume` basic version

Engineer B (Frontend UX)
- Landing + onboarding pages
- Recommendation list + job detail page
- Tailor result panel
- Error/fallback states

Engineer C (Integrations + QA)
- Jobs fetch integration + fallback seeding
- Analytics `/events`
- Manual E2E testing script + seed pilot users
- Final polish + bugfix support

---

## 9) 4-hour execution timeline

Hour 0:00–0:20
- Align on scope freeze + API contracts + sample payloads

Hour 0:20–1:20
- Backend schema/routes scaffold
- Frontend pages/components scaffold
- Integration stubs

Hour 1:20–2:20
- Wire real recommendation scoring
- Wire onboarding -> recommendations -> tailor flow
- Add fallback paths

Hour 2:20–3:10
- End-to-end dry run with 3 seeded users
- Fix high-severity UX/API bugs

Hour 3:10–4:00
- Pilot readiness checklist
- Deploy/stage locally or one cloud preview
- Onboard first 5–10 external pilot users

---

## 10) Validation + acceptance criteria

Functional acceptance:
1. User can submit resume text or manual summary and proceed
2. System returns >=10 relevant jobs with visible match score
3. Tailor action returns tailored resume draft in <12s median
4. User can open Apply URL for each job

Quality gates:
- Run `pnpm run lint`
- Run `pnpm run build`
- Manual happy path + 2 failure paths tested

Pilot metrics (minimum):
- onboarding completion rate
- recommendation click-through rate
- tailor generation success rate
- % users who copy/export tailored content

---

## 11) Risk register + mitigations

1. LinkedIn scraping/legal/anti-bot risk
   - Mitigation: LinkedIn URL optional; manual summary fallback required

2. Job API instability/rate limits
   - Mitigation: maintain seeded job fallback table and cached responses

3. LLM latency/cost
   - Mitigation: deterministic fallback tailoring + short prompts

4. Thin auth in MVP
   - Mitigation: pilot-only environment + non-sensitive data guidance

---

## 12) Pilot script (what to do with first users)

1. Recruit 5–10 users from 2 job families (e.g., SWE + PM)
2. Ask each to complete onboarding live (5 min)
3. Observe: did they understand match reasons and tailoring output?
4. Capture NPS-style quick rating (1–5) + “Would you apply with this resume?”
5. Log top 3 confusion points for next sprint.

---

## 13) Immediate next sprint after pilot

- Better parsing (PDF/docx robust extraction)
- Saved job collections and re-tailor history
- True auth hardening + session model
- Improved ranking with feedback loop from click/apply behavior
- ATS format export (docx/pdf)

---

## 14) Concrete file change list for this repo

Backend:
- Modify: `apps/api/prisma/schema.prisma`
- Modify: `apps/api/src/index.ts`
- Optional create (if splitting routes):
  - `apps/api/src/routes/ingest.ts`
  - `apps/api/src/routes/recommendations.ts`
  - `apps/api/src/routes/tailor.ts`
  - `apps/api/src/services/ranking.ts`
  - `apps/api/src/services/tailor.ts`

Frontend:
- Modify: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/onboarding/page.tsx`
- Create: `apps/web/src/app/recommendations/page.tsx`
- Create: `apps/web/src/app/recommendations/[jobId]/page.tsx`
- Create/Modify: `apps/web/src/lib/types.ts`
- Create: `apps/web/src/lib/api.ts`
- Create components under `apps/web/src/components/`

Validation:
- Run from repo root: `pnpm run lint && pnpm run build`

---

If you want, I can now convert this plan into an exact execution checklist with task IDs and owner tags (A/B/C), and then start implementing it directly in this repo in priority order.