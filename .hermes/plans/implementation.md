# Career Accelerator MVP — Production-Minded Implementation Plan

Status: approved direction for planning
Primary goal: ship a hackathon-ready Career Accelerator while preserving a safe path to production
Product scope: resume upload or LinkedIn URL via Linkup → Hermes candidate-persona parsing → ranked jobs → job-specific resume tailoring → apply/copy action
Architecture decision: Next.js client + Node/Express API + MongoDB/Mongoose + Hermes-managed AI runtime

Related requirements:
- `.hermes/plans/2026-07-12_131343-career-accelerator-mvp-plan.md`
- `.hermes/plans/2026-07-12_132005-additional-ai-agent-plans-buildathon.md`
- `AGENTS.md`

## 1. Scope and decision summary

### Must ship for the hackathon

1. Candidate can choose one of two explicit persona-ingestion routes: PDF/DOCX resume upload (with pasted-text recovery) or LinkedIn URL enrichment through Linkup.
2. Candidate can set target role, location, and work mode.
3. The production path sends extracted resume content through a real Hermes-managed parsing pipeline and stores a structured candidate persona.
4. System returns at least 10 ranked jobs with match reasons.
5. Candidate can generate a tailored headline, summary, bullets, and keyword gaps for one job.
6. Candidate can copy tailored content and open the external apply URL.
7. The critical flow continues when external job or model providers fail.
8. All agentic execution is mediated by Hermes.
9. Basic analytics, request validation, safe error handling, and health checks exist.
10. Clerk authentication is deferred on the `resume-parser` branch so the two parsing endpoints can be validated independently; authentication is restored before public production launch.
11. The repository passes lint, tests, and build.

### Should ship if cheap

- Saved jobs.
- Tailoring history.
- Candidate feedback on recommendation quality.
- One-click retry for failed AI work.
- Deployment preview and basic error monitoring.

### Explicitly deferred

- Generic agent builder and agent marketplace.
- User-configurable tools, skills, prompts, or model providers.
- Direct LinkedIn scraping, browser automation, authenticated-session scraping, and private LinkedIn OAuth ingestion. LinkedIn ingestion is allowed only through the Linkup API using public web results and explicit user consent.
- Automated job application and browser autofill.
- Multi-tenant runtime provisioning.
- One Hermes container per end-user or per configured agent.
- WebSockets, queues, Redis, microservices, Kubernetes, and event sourcing.
- Billing, subscriptions, enterprise RBAC, and full admin UI.
- Semantic/vector search until deterministic ranking is measured and insufficient.

## 2. Architecture

```text
Next.js 14 App Router
  ├── Landing and onboarding
  ├── Recommendation list and job detail
  └── Tailoring result and analytics events
             │ HTTPS/JSON
             ▼
Node.js + Express control plane
  ├── Validation, auth boundary, rate limits
  ├── Candidate/profile service
  ├── Job ingestion and normalization service
  ├── Deterministic ranking service
  ├── Tailoring orchestration service
  ├── HermesRuntime adapter
  └── Analytics and health endpoints
       │                    │
       ▼                    ▼
MongoDB/Mongoose       Hermes runtime profile
Product records         ├── candidate-parser identity
                        ├── resume-tailor identity
                        ├── least-privilege tools/skills
                        └── provider/model execution
       ▲                    │
       └──── normalized structured results ────┘
```

Boundaries:
- Browser never talks directly to Hermes or receives model credentials.
- Express is the public API and authorization boundary.
- Hermes is the only agent harness and owns model execution.
- MongoDB stores product data and AI run metadata, not Hermes internal transcripts or memory.
- Ranking remains deterministic in the MVP; Hermes enriches parsing and tailoring.
- External job search and LinkedIn enrichment are behind adapters. Linkup is invoked server-side with `LINKUP_API_KEY`; the browser never receives provider credentials.

### 2.1 Resume-parser branch API contract

The `resume-parser` branch exposes two explicit backend endpoints for frontend validation before Clerk is resumed:

1. `POST /v1/parse/resume`
   - `multipart/form-data` with `resume`, `targetRole`, `preferredLocations`, and `workModes`.
   - Accept PDF/DOCX only, maximum 5 MB, validate MIME and magic bytes, extract text in memory, and pass normalized text to `HermesRuntime.parseCandidate`.
2. `POST /v1/parse/linkedin`
   - JSON with `linkedinUrl`, `targetRole`, `preferredLocations`, and `workModes`.
   - Validate an HTTPS `linkedin.com` profile URL, call Linkup `POST https://api.linkup.so/v1/search` server-side with `depth: "standard"` and `outputType: "sourcedAnswer"`, then send the grounded answer to `HermesRuntime.parseCandidate`.

Both return the same strict `CandidatePersona` envelope plus source/provenance. `LINKUP_API_KEY` remains a server-side environment placeholder. Missing Linkup or Hermes credentials return explicit `503` errors in production; they are never substituted with fabricated remote data. Add rate limiting and Clerk authentication before exposing these endpoints publicly.

## 3. Hackathon implementation choices that remain production-compatible

| Area | Hackathon choice | Production path |
|---|---|---|
| Database | Existing MongoDB/Mongoose | Managed MongoDB, indexes, backups, retention |
| API | Single Express service | Preserve modules; split only after measured need |
| AI runtime | One preconfigured Hermes service/profile | Isolated replicas and profile deployment later |
| AI execution | Narrow `HermesRuntime` interface | Replace adapter without changing domain services |
| Job source | Seeded jobs plus one optional provider | Add provider adapters, caching, deduplication |
| Ranking | Weighted deterministic score | Add feedback, embeddings, or learning-to-rank later |
| File ingest | PDF/DOCX upload plus text recovery path | Object storage, antivirus scan, async extraction, retention controls |
| Auth | Clerk hosted/prebuilt sign-in with protected candidate routes | Clerk session verification, user mapping, webhook reconciliation, and authorization |
| Async work | Synchronous request with timeout | Queue only when latency/volume requires it |
| Analytics | Append-only event collection | Product analytics and warehouse export later |
| Deployment | Web, API, MongoDB, Hermes runtime | Independent scaling and managed secrets |

### 3.1 Deferred Clerk authentication decision

Do not put Clerk on the `resume-parser` branch critical path. Keep the documented Clerk design for the later integration branch rather than building password, OAuth, email verification, cookie, or account-recovery infrastructure ourselves.

Why it fits this repository:
- Clerk has first-party SDKs for both sides of the current architecture: `@clerk/nextjs` for the Next.js App Router and `@clerk/express` for the Express API.
- The Next.js integration provides `clerkMiddleware()`, `<ClerkProvider>`, and prebuilt sign-in/user components.
- The Express integration provides `clerkMiddleware()` and `getAuth()` for verified request identity.
- It keeps authentication out of Hermes. Hermes receives an internal candidate identifier and authorized task input, never a Clerk secret or browser session token.
- Prebuilt UI and managed sign-in flows are appropriate for the hackathon, while server-side token verification and explicit ownership checks remain production-compatible.

Selected MVP flow:
1. Add `<ClerkProvider>` at the Next.js root layout.
2. Add Next.js `clerkMiddleware()` and protect `/onboarding`, `/recommendations`, `/jobs/*`, and `/tailored/*`.
3. Use Clerk's prebuilt sign-in/sign-up experience unless visual customization is essential for the demo.
4. The web client sends its Clerk session token when calling the Express API.
5. Express runs Clerk middleware before `/v1` routes and derives `clerkUserId` with `getAuth()`.
6. Express resolves `clerkUserId` to the local `Candidate` record; services receive the local candidate ID, not an ID supplied by the browser.
7. Every candidate-owned route compares the authenticated candidate with the requested resource owner.
8. Public routes are limited to liveness/readiness and any explicitly public job/landing data.

Important production rules:
- Authentication answers "who is calling"; application authorization still belongs in Express.
- Never trust `candidateId`, email, role, or organization claims sent in a request body.
- Never expose `CLERK_SECRET_KEY` to the browser; only `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is public.
- Do not store Clerk session tokens in MongoDB or application logs.
- Configure development, staging, and production as separate Clerk instances/environments.
- Configure allowed origins, redirect URLs, and production domain explicitly.
- Require a verified primary email before creating a production candidate if email is used for communication.
- Treat Clerk downtime as an authentication outage: fail protected operations closed rather than accepting an unverified identity.

Webhook scope:
- Hackathon: create the local `Candidate` lazily on the first authenticated API request. This avoids making webhook setup part of the demo critical path.
- Production hardening: add signed Clerk webhooks for `user.created`, `user.updated`, and `user.deleted` to reconcile profile data and disable/delete local records as required.
- Webhook handlers must verify Clerk/Svix signatures against the raw request body, be idempotent by event ID, and must not use the normal JSON parser before signature verification.
- Clerk webhooks are synchronization signals, not authorization for interactive API requests.

Evaluation checkpoint before implementation:
- Confirm required sign-in methods (email code/link, password, Google, GitHub).
- Confirm Clerk plan limits and production pricing against expected pilot/launch MAU.
- Confirm data residency, privacy, deletion, and compliance requirements for target users.
- Confirm custom-domain and redirect behavior on the selected hosting platform.
- Record the go/no-go result in `docs/auth-clerk-evaluation.md`; fallback is a standards-based OIDC provider behind the same `AuthenticatedUser` middleware contract, not custom password auth.

Official references checked for this plan:
- Next.js App Router quickstart: https://clerk.com/docs/nextjs/getting-started/quickstart
- Express quickstart: https://clerk.com/docs/expressjs/getting-started/quickstart
- Clerk documentation root: https://clerk.com/docs

## 4. Domain models

Use Mongoose because it is already installed and configured. Do not introduce Prisma/Postgres in this sprint.

### 4.1 Candidate

Purpose: stable candidate identity and onboarding state.

Fields:
- `_id: ObjectId`
- `clerkUserId: string` — required, immutable, unique external identity key
- `email?: string` — normalized; unique sparse index if collected
- `displayName?: string`
- `status: 'onboarding' | 'ready' | 'disabled'`
- `consents: { resumeProcessingAt?: Date; analyticsAt?: Date }`
- `createdAt`, `updatedAt`

Indexes:
- unique `clerkUserId`
- unique sparse `email`
- `createdAt`

### 4.2 CandidateProfile

Purpose: resume-ingestion record and current Hermes-derived candidate persona.

Fields:
- `_id: ObjectId`
- `candidateId: ObjectId` — unique
- `resumeText: string` — extracted from the upload or supplied through the recovery textarea; bounded and sensitive
- `resumeFile: { name; mimeType; sizeBytes; storageKey?; sha256 }`
- `extraction: { status: 'pending' | 'completed' | 'failed'; extractorVersion; pageCount?; warnings: string[] }`
- `targetRole: string`
- `preferredLocations: string[]`
- `workModes: ('remote' | 'hybrid' | 'onsite')[]`
- `persona: { headline; summary; yearsExperience?; seniority?; skills: string[]; industries: string[]; currentRole?; roles: string[]; locations: string[]; education: string[]; experience: { company?; title; startDate?; endDate?; bullets: string[] }[]; achievements: string[]; preferences: { targetRole; preferredLocations: string[]; workModes: string[] } }`
- `parseStatus: 'pending' | 'completed' | 'fallback' | 'failed'`
- `hermesRunId?: string`
- `parseVersion: string`
- `createdAt`, `updatedAt`

Indexes:
- unique `candidateId`
- `persona.skills`
- `targetRole`

Retention:
- Never log resume bytes or extracted text.
- Delete raw uploads after successful extraction unless explicit retention is required and consented to; extracted text and persona follow the candidate deletion policy.

### 4.3 JobOpening

Purpose: normalized jobs independent of source.

Fields:
- `_id: ObjectId`
- `source: 'seed' | 'linkup' | 'other'`
- `externalId: string`
- `title`, `company`, `location`
- `workMode?: 'remote' | 'hybrid' | 'onsite' | 'unknown'`
- `employmentType?: string`
- `description: string`
- `skills: string[]`
- `minYearsExperience?: number`
- `applyUrl: string`
- `postedAt?: Date`
- `expiresAt?: Date`
- `isActive: boolean`
- `sourcePayloadHash?: string`
- `createdAt`, `updatedAt`

Indexes:
- unique compound `{ source, externalId }`
- `{ isActive, postedAt }`
- `title`, `skills`, `location`

### 4.4 Recommendation

Purpose: reproducible candidate-to-job ranking.

Fields:
- `_id: ObjectId`
- `candidateId`, `profileId`, `jobId`
- `score: number` — 0–100
- `components: { skill: number; title: number; location: number; experience: number }`
- `matchedSkills: string[]`
- `missingSkills: string[]`
- `reasons: string[]`
- `rankingVersion: string`
- `generatedAt`, `expiresAt?`

Indexes:
- unique compound `{ candidateId, jobId, rankingVersion }`
- `{ candidateId, score: -1 }`

### 4.5 TailoredResume

Purpose: preserve generated output and support retries/history.

Fields:
- `_id: ObjectId`
- `candidateId`, `profileId`, `jobId`
- `status: 'pending' | 'completed' | 'fallback' | 'failed'`
- `inputHash: string` — idempotency/cache key
- `output: { headline: string; summary: string; bullets: string[]; keywordsToAdd: string[]; cautions: string[] }`
- `provider?: string`, `model?: string`
- `promptVersion: string`
- `latencyMs?: number`
- `errorCode?: string`
- `createdAt`, `updatedAt`

Indexes:
- `{ candidateId, createdAt: -1 }`
- unique sparse `inputHash` for completed results

### 4.6 AnalyticsEvent

Fields:
- `_id`, `candidateId?`, `sessionId?`
- `type` from an allowlist
- `metadata` with sensitive keys rejected
- `createdAt`

Initial event allowlist:
- `onboarding_started`
- `profile_submitted`
- `profile_parsed`
- `recommendations_viewed`
- `job_opened`
- `tailoring_started`
- `tailoring_completed`
- `tailoring_failed`
- `tailoring_copied`
- `apply_clicked`

Indexes:
- `{ type, createdAt }`
- `{ candidateId, createdAt }`

### 4.7 AgentRun

Purpose: product-level observability without copying Hermes transcripts.

Fields:
- `_id`, `candidateId?`
- `operation: 'profile_parse' | 'resume_tailor' | 'job_search'`
- `requestId`, `hermesSessionId?`
- `status`, `durationMs?`, `fallbackUsed: boolean`
- `provider?`, `model?`, `usage?`
- `errorCode?`, `createdAt`, `completedAt?`

Do not store raw prompts, resume text, or job descriptions here.

## 5. Service and module layout

Target structure; create only modules used by the vertical slice:

```text
apps/api/src/
  app.ts
  index.ts
  config/{env,database,logger}.ts
  models/{candidate,candidateProfile,jobOpening,recommendation,tailoredResume,analyticsEvent,agentRun}.model.ts
  routes/{candidates,jobs,recommendations,tailoring,events,health}.routes.ts
  controllers/{candidate,jobs,recommendation,tailoring,event}.controller.ts
  services/
    profile/profile.service.ts
    profile/profileParser.ts
    jobs/job.service.ts
    jobs/jobProvider.ts
    jobs/seedJobProvider.ts
    jobs/linkupJobProvider.ts
    recommendations/ranking.service.ts
    tailoring/tailoring.service.ts
    analytics/analytics.service.ts
  runtimes/
    HermesRuntime.ts
    FakeHermesRuntime.ts
    hermes/hermesRuntime.ts
    hermes/types.ts
  schemas/{candidate,jobs,tailoring,event}.schema.ts
  middlewares/{requestId,rateLimit,error,notFound}.ts
  utils/{errors,hash,text}.ts
```

Rules:
- Routes bind URLs and middleware only.
- Controllers translate HTTP input/output only.
- Services contain use cases and domain logic.
- Models contain persistence shape and indexes.
- Only the Hermes adapter knows Hermes transport/configuration details.
- No controller invokes Hermes CLI or model SDK directly.
- Do not add repositories until a second persistence implementation is required.

## 6. Hermes runtime design

### 6.1 MVP agent identities

Use two fixed product agents, not a generic agent builder:

1. `candidate-resume-parser`
   - Input: server-extracted resume text plus target preferences and extraction warnings.
   - Output: strict `CandidatePersona` JSON with evidence constrained to the resume.
   - Tools: no terminal, browser, messaging, or file writes.
   - Guardrails: low turn count, short timeout, bounded input.
   - Must not invent employers, roles, dates, education, achievements, metrics, or skills.
   - Fallback: deterministic keyword/title parser marked `parseStatus: 'fallback'`; telemetry distinguishes it from the real Hermes path.

2. `resume-tailor`
   - Input: candidate facts and selected job description.
   - Output: strict structured JSON.
   - Must not invent employers, dates, degrees, metrics, or skills.
   - Tools: no external writes; no terminal or messaging.
   - Fallback: deterministic template using only verified candidate facts.

Job search through Linkup, if used, must run as a Hermes-managed tool/task. It is not called directly from the browser.

### 6.2 Narrow runtime contract

```text
parseCandidate(input, context) -> ParsedCandidate
 tailorResume(input, context) -> TailoredResumeOutput
 health() -> RuntimeHealth
```

Required behavior:
- Production uses the real Hermes transport; `FakeHermesRuntime` is limited to automated tests and explicitly labeled local fixture mode.
- File extraction occurs in Node before Hermes invocation; Hermes receives normalized text, never an untrusted local file path.
- Timeout each operation.
- Validate runtime output again with Zod in Node.
- Map transport/model errors to stable application error codes.
- Attach request ID and optional Hermes session ID.
- Never return raw runtime errors to the browser.
- Support `FakeHermesRuntime` for tests and local UI work.

### 6.3 Integration spike — blocker before real AI wiring

Prove and document:
1. The supported Hermes API/gateway endpoint for server-side requests.
2. Authentication between Node and Hermes.
3. Profile selection.
4. Session creation/resume semantics.
5. Structured response behavior.
6. Timeout/cancellation behavior.
7. Health endpoint and failure modes.
8. Container/process topology.

Deliverable: `docs/hermes-integration-spike.md` plus a disposable script/test.

Do not put `hermes chat -q` per request on the production critical path. A CLI subprocess may be used only for the local spike while the persistent interface is verified.

## 7. API contract

Prefix all product APIs with `/v1`.

Authentication conventions:
- All candidate, recommendation, tailoring, and event-write routes require a verified Clerk session.
- Express derives identity through `@clerk/express`; route handlers must not decode JWTs manually.
- `POST /v1/candidates` is an authenticated, idempotent "resolve or create me" operation keyed by `clerkUserId`.
- Prefer `/v1/me/...` for new candidate-owned endpoints. If `:candidateId` remains for MVP compatibility, enforce equality with the authenticated candidate.
- Internal job-sync routes require separate server/admin authorization; a normal signed-in candidate is insufficient.

### Candidate and profile

- `POST /v1/candidates`
  - Creates pilot candidate or resolves current authenticated candidate.
- `POST /v1/candidates/:candidateId/resume`
  - Accepts one PDF or DOCX multipart upload within configured MIME/size limits, or bounded pasted text as a recovery mode.
  - Extracts text server-side, computes a content hash, then invokes the real Hermes `candidate-resume-parser` pipeline.
  - Validates and persists the `CandidatePersona` plus provenance/status; never returns raw resume text.
- `PUT /v1/candidates/:candidateId/profile/preferences`
  - Updates target role, preferred locations, and work modes, then re-ranks without reparsing unchanged resume content.
- `GET /v1/candidates/:candidateId/profile`
  - Ownership check required.

### Jobs and recommendations

- `POST /v1/jobs/sync`
  - Internal/admin only; fetches and upserts normalized jobs.
  - Seed fallback is mandatory.
- `POST /v1/candidates/:candidateId/recommendations`
  - Generates/upserts ranking for active jobs.
  - Returns top 20 by default.
- `GET /v1/candidates/:candidateId/recommendations?limit=20&cursor=...`
  - Returns joined job cards and score explanation.
- `GET /v1/jobs/:jobId`
  - Returns sanitized job details.

### Tailoring

- `POST /v1/candidates/:candidateId/tailored-resumes`
  - Body: `{ jobId }`.
  - Idempotent for unchanged profile + job + prompt version.
  - Returns AI result or deterministic fallback.
- `GET /v1/candidates/:candidateId/tailored-resumes/:id`
  - Ownership check required.

### Analytics and operations

- `POST /v1/events`
  - Validates event allowlist and metadata size.
- `GET /health/live`
  - Process is alive; no downstream calls.
- `GET /health/ready`
  - MongoDB connected and required configuration present.
  - Hermes health may be reported as degraded rather than making the whole API unavailable because fallbacks exist.

HTTP conventions:
- Zod validation on params, query, and body.
- Standard envelope: `{ data, requestId }`.
- Standard error: `{ error: { code, message, fieldErrors? }, requestId }`.
- `400` validation, `401` unauthenticated, `403` forbidden, `404` missing, `409` state/idempotency conflict, `429` limited, `503` dependency unavailable.

## 8. Ranking algorithm v1

Normalize strings by lowercasing, trimming, removing punctuation, and mapping a small alias dictionary such as `js → javascript`.

Score components:
- Skill overlap: 40 points.
- Target/title similarity: 25 points.
- Location/work-mode compatibility: 20 points.
- Experience fit: 15 points.

Rules:
- Cap total to 0–100.
- Missing experience data is neutral, not zero.
- Remote preference can match remote jobs regardless of location.
- Emit component scores, matched skills, missing skills, and 2–3 human-readable reasons.
- Persist `rankingVersion = 'v1'`.
- Unit test exact fixtures so score changes are intentional.

Do not use an LLM for the ranking score in the MVP. This makes recommendations fast, explainable, cheap, and available during model outages.

## 9. Frontend vertical slice

### Routes

- `/` — value proposition, three-step explanation, CTA.
- `/onboarding` — PDF/DOCX upload or pasted-text recovery, target role, location, work mode, consent, extraction/parsing progress.
- `/recommendations` — ranked cards, loading/empty/degraded/error states.
- `/jobs/[jobId]` — full job, match explanation, tailor and apply actions.
- `/tailored/[tailoredResumeId]` or an in-page panel — output, copy, retry.

### Components

- `OnboardingForm`
- `ResumeInput`
- `CandidatePersonaReview`
- `PreferenceFields`
- `RecommendationCard`
- `MatchScore`
- `MatchReasons`
- `TailoringResult`
- `FallbackNotice`
- `AsyncButton`

### Client state rules

- Use server/API state directly; do not add a global state library.
- Disable duplicate submissions.
- Preserve onboarding values after recoverable errors.
- Show explicit fallback/degraded state without blocking progress.
- Never render raw API/runtime errors.
- Track primary CTA events.

### Accessibility and UX acceptance

- Keyboard-accessible forms and actions.
- Labels and inline validation for all fields.
- Visible focus states.
- Loading states do not shift the entire page.
- Mobile layout works at 375px width.
- Copy action confirms success.

## 10. Security and privacy minimum bar

Must be implemented before public production:
- Verify every protected request with Clerk middleware in Express; frontend protection alone is insufficient.
- Derive local candidate ownership from the verified Clerk user ID.
- Keep Clerk secret keys and webhook signing secrets server-only and redact authorization headers/session tokens.
- Configure Clerk production domain, allowed origins, redirects, sign-in methods, and verified-email policy.
- Do not expose Hermes, MongoDB, or provider credentials to Next.js.
- Validate ownership on every candidate-specific route.
- Add request body limits; current API limit is 1 MB.
- Enforce one-file multipart limits, MIME allowlist, extension/content consistency, and resume size limits before extraction.
- Scan uploaded files before extraction in production and isolate parser execution from network and unrestricted filesystem access.
- Allowlist CORS origins; no wildcard credentials.
- Sanitize external apply URLs to `https:`/`http:` only.
- Escape/render job descriptions as text; no unsanitized HTML.
- Rate-limit profile parse and tailoring endpoints.
- Bound resume and job-description input lengths.
- Keep secrets in deployment secret storage, never MongoDB or git.
- Redact resume text and personal data from logs.
- Return stable error codes, not stack traces.
- Add explicit consent copy for resume processing.
- Show and allow correction of the derived candidate persona before it drives recommendations.
- Provide a manual deletion procedure for pilot users.

Can follow immediately after hackathon but before wider launch:
- Signed Clerk lifecycle webhooks and local-account reconciliation.
- Account deletion propagation and an auth-provider incident runbook.
- Automated deletion endpoint and retention job.
- Malware scanning and object storage for uploaded files.
- Dependency and container scanning in CI.
- Audit review and abuse monitoring.

## 11. Observability and reliability

Structured log fields:
- timestamp, level, service, environment
- requestId, route, method, statusCode, durationMs
- candidateId as an internal ID only
- operation, fallbackUsed, errorCode

Never log:
- Resume/manual-summary text.
- Full prompts or model output.
- API keys, cookies, authorization headers.

Initial metrics:
- API request count/error/latency by route.
- Profile parse success and fallback rate.
- Job provider success and fallback rate.
- Recommendation generation latency.
- Tailoring success, fallback, and latency.
- Funnel events from onboarding to apply click.

Reliability behavior:
- Model unavailable → deterministic parser/tailor fallback.
- Job provider unavailable → active seeded jobs.
- MongoDB unavailable → readiness fails; writes return 503.
- Duplicate submit → idempotent result or 409, never duplicate uncontrolled AI calls.
- Hermes degraded → API remains ready for deterministic paths and reports degraded dependency status.

## 12. Parallel workstreams

Use four lanes. With three engineers, combine Lane D with the least-blocked engineer. Hermes subagents can handle bounded file-scoped work, but the main session owns contracts and integration.

### Lane A — Backend and data

A1. Define Zod API contracts and shared response/error shapes.
- Depends on: none.
- Output: request/response schemas and examples.
- Acceptance: all planned route payloads compile and invalid fixtures fail.

A2. Add Mongoose models and indexes.
- Depends on: A1 field decisions.
- Acceptance: model tests create/read records and duplicate indexes reject correctly.

A3. Implement candidate/profile routes and service.
- Depends on: A1, A2; parser can start with fake/deterministic implementation.
- Acceptance: PDF/DOCX or pasted text → extracted text → real Hermes parse in production → validated, persisted candidate persona; fallback is explicit and observable.

A4. Implement job provider interface, seed provider, and sync/upsert.
- Depends on: A2.
- Acceptance: repeated sync is idempotent and >=10 active jobs exist.

A5. Implement ranking v1 and recommendation routes.
- Depends on: A2, A3, A4.
- Acceptance: deterministic fixture scores and ordered response.

A6. Implement tailoring persistence and orchestration.
- Depends on: A2 and runtime contract from Lane C.
- Acceptance: successful and fallback results persist; duplicate input reuses result.

### Lane B — Frontend

B1. Define typed API client and frontend domain types from A1 examples.
- Depends on: A1 contract freeze only.

B2. Build landing and onboarding flow against a mock/fake API response.
- Depends on: B1.
- Acceptance: validated form navigates to recommendations.

B3. Build recommendation list and job detail.
- Depends on: B1 sample responses.
- Acceptance: score reasons, missing keywords, apply link, loading/empty/error states.

B4. Build tailoring result and copy/retry UX.
- Depends on: B1 sample response.
- Acceptance: structured result renders and copy event is emitted.

B5. Integrate live API and mobile/accessibility pass.
- Depends on: A3, A5, A6.
- Acceptance: full browser happy path and one degraded path.

### Lane C — Hermes runtime and AI behavior

C1. Complete Hermes integration spike and document verified transport.
- Depends on: none; critical technical risk.
- Acceptance: health, request, structured output, timeout, and profile selection demonstrated.

C2. Define `HermesRuntime` and `FakeHermesRuntime`.
- Depends on: minimal assumptions; refine after C1.
- Acceptance: API services can run tests without Hermes or paid model calls.

C3. Create fixed parser and tailorer prompts/skills with strict schemas.
- Depends on: A1 profile and output contracts.
- Acceptance: fixture resumes produce valid `CandidatePersona` output with no invented facts and traceable parse provenance.

C4. Implement real adapter plus timeout/error mapping.
- Depends on: C1, C2, C3.
- Acceptance: live smoke test and forced-failure fallback test.

C5. Add Linkup-backed job search only if seed path and core flow are already green.
- Depends on: A4, C1.
- Acceptance: results normalize to `JobOpening`; provider failure falls back to seeds.

### Lane D — QA, deployment, and product readiness

D1. Add request ID, error handler, validation tests, and health endpoints.
- Can start immediately.

D2. Add unit/integration tests for ranking, fallbacks, ownership, and URL sanitization.
- Depends incrementally on Lane A.

D3. Create demo seed data and deterministic demo candidate.
- Depends on model shapes only.

D4. Add deployment configuration for web, API, MongoDB, and Hermes service.
- Depends on C1 topology decision.

D5. Run end-to-end smoke checklist and capture results.
- Depends on A/B/C integration.

D6. Add production-launch checklist and rollback procedure.
- Can draft in parallel; finalize after deployment.

### Lane E — Clerk authentication

With three engineers, split E between frontend and backend owners while Clerk dashboard setup proceeds independently.

E1. Complete the Clerk evaluation checkpoint.
- Confirm sign-in methods, environments, expected MAU/pricing, domain setup, privacy requirements, and fallback decision.
- Acceptance: `docs/auth-clerk-evaluation.md` records go/no-go and selected flows.

E2. Create Clerk development/staging applications and document environment names without recording secrets.
- Depends on: E1 go decision.
- Acceptance: keys are supplied only through local/deployment secret stores.

E3. Integrate `@clerk/nextjs`.
- Add `<ClerkProvider>`, Next.js middleware, prebuilt sign-in/sign-up UI, user menu, and protected product routes.
- Acceptance: anonymous users sign in and return to their intended route.

E4. Integrate `@clerk/express`.
- Add Clerk middleware, an `AuthenticatedUser` request context, lazy candidate resolution, and ownership middleware.
- Acceptance: valid session succeeds; missing/invalid session returns 401; cross-candidate access returns 403.

E5. Add auth integration and failure-path tests.
- Cover candidate upsert idempotency, protected routes, expired/invalid tokens, CORS, and logout/session expiry.
- Acceptance: tests do not call Clerk production or require real user credentials.

E6. Add signed lifecycle webhooks after the core demo is green.
- Production requirement, not a hackathon blocker.
- Acceptance: signature verification, event idempotency, update/delete handling, and replay tests are documented and verified.

## 13. Dependency graph and merge order

```text
Contract freeze (A1)
  ├── Models (A2) ── Candidate (A3) ───────────────┐
  ├── Frontend mocks (B1/B2/B3/B4)                 │
  └── AI schemas (C3)                              │
                                                    ▼
Hermes spike (C1) → Runtime interface (C2) → Adapter (C4)
                                                    │
Jobs/seeds (A4) → Ranking (A5)                     │
             └──────────────────────────────┬───────┘
                                            ▼
                                  Tailoring service (A6)
                                            ▼
                                  Live UI integration (B5)
                                            ▼
                                  E2E + deploy (D4/D5)
```

Recommended merge order:
1. Contracts, Clerk evaluation, errors, and fake runtime.
2. Models, Clerk user mapping, and seed fixtures.
3. Candidate/profile path with verified identity.
4. Jobs and deterministic recommendations.
5. Tailoring fallback path.
6. Protected frontend vertical slice against live API.
7. Real Hermes adapter.
8. Optional external job provider.
9. Auth failure tests, hardening, E2E, and deployment.

This order ensures a demo can work before any external integration is complete.

## 14. Timeboxed execution

### Hackathon block 0 — 30 minutes: freeze
- Confirm one primary demo persona and target role.
- Freeze API examples and model fields.
- Assign lanes and file ownership.
- Confirm deployment target and Hermes availability.
- Complete Clerk go/no-go evaluation and select sign-in methods.
- Seed 10–20 representative jobs.

Exit: frontend and backend can work independently from shared examples.

### Block 1 — 90 minutes: skeletons in parallel
- Lane A: models, profile endpoint, seed jobs.
- Lane B: onboarding and recommendation UI with fixtures.
- Lane C: Hermes spike and fake runtime.
- Lane D: health, error shape, test skeleton, demo data.
- Lane E: Clerk applications, Next.js integration, and Express verification middleware.

Exit: onboarding can persist data; UI renders realistic recommendations; Hermes transport risk is known.

### Block 2 — 90 minutes: core vertical slice
- Ranking service and recommendation endpoint.
- Deterministic tailoring fallback.
- Live frontend API integration.
- Real Hermes parser/tailor adapter if spike succeeded.

Exit: full local happy path works with external providers disabled.

### Block 3 — 60 minutes: integrations and failure paths
- Add real Hermes path.
- Add Linkup only if core is green.
- Verify fallback for Hermes and job provider failure.
- Add analytics events.

Exit: demo survives dependency failures.

### Block 4 — 60 minutes: ship
- Run tests, lint, and build.
- Execute manual mobile and desktop happy path.
- Deploy preview/staging.
- Verify health endpoints and one real tailoring run.
- Freeze changes except blocker fixes.

## 15. Definition of done by milestone

### M0 — Contracts frozen
- API examples approved.
- Models and ownership rules agreed.
- No unresolved Prisma/Postgres vs MongoDB ambiguity.

### M1 — Offline demo path
- Seed jobs loaded.
- Deterministic parse, rank, and tailor work.
- Offline AI/job behavior requires no model or job-provider credentials; Clerk development credentials are required for the authenticated product flow.

### M2 — Hermes-enabled demo path
- Node invokes Hermes through the verified adapter.
- Parser and tailor output pass Zod validation.
- Runtime timeout or invalid output triggers fallback.

### M3 — Integrated product
- Onboarding → recommendations → job → tailoring → copy/apply works.
- Sign-in, protected navigation, authenticated API calls, and logout/session expiry work.
- Analytics records the funnel.
- Mobile layout and basic accessibility pass.

### M4 — Deployable build
- `pnpm --dir apps/api test`
- `pnpm run lint`
- `pnpm run build`
- Health checks pass in deployed environment.
- No secrets or sensitive fixtures are committed.
- Rollback procedure is documented and tested at least once on staging.

## 16. Test plan

### Unit
- PDF/DOCX extractor adapters, MIME/size validation, and content-hash idempotency.
- Text normalization and skill aliasing.
- Each ranking component and total score.
- Missing-data scoring behavior.
- Deterministic parser and tailoring fallback.
- Zod validation and URL sanitization.
- Input hash/idempotency behavior.

### API integration
- Health live/ready.
- Missing/invalid Clerk sessions return 401 on protected routes.
- A valid Clerk identity lazily creates or resolves exactly one candidate.
- Cross-candidate access returns 403.
- Clerk identities created through disabled/non-Google methods are rejected if such an account is introduced through dashboard misconfiguration.
- Profile create/update and invalid input.
- Resume upload invokes the real Hermes adapter in production configuration; fake runtime is rejected outside test/local-fixture mode.
- Invalid/oversized files fail before Hermes invocation, and API responses never include raw resume text.
- Candidate ownership denial.
- Job sync idempotency.
- Recommendation ordering and limit.
- Tailoring success, fake-runtime failure, and fallback.
- Event allowlist and metadata rejection.

### UI/manual smoke
1. Open landing page, confirm Google is the only sign-in option, authenticate through Clerk, and return to onboarding.
2. Confirm protected URLs redirect anonymous users, then upload a resume and submit role/location/work mode.
3. Review/correct the Hermes-derived candidate persona, then confirm at least 10 recommendations and understandable reasons.
4. Open a job and generate tailoring.
5. Copy content and open apply URL.
6. Repeat with Hermes disabled; verify fallback notice and completed flow.
7. Repeat with job provider disabled; verify seed jobs.
8. Log out and verify protected pages and API operations are no longer accessible.
9. Check 375px mobile viewport and keyboard navigation.

### Non-functional smoke
- Oversized input rejected.
- Rapid duplicate tailoring request does not create duplicate runs.
- Raw stack traces and secrets absent from client responses/logs.
- API returns controlled 503 when MongoDB is unavailable.

## 17. Deployment plan

Initial topology:
- Next.js service.
- Express API service.
- Managed MongoDB or protected MongoDB container for staging only.
- Internal Hermes service/profile with persistent state and secret injection.

Required environment groups:
- Web: public API base URL and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- API: Mongo URI, allowed origins, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, optional Clerk webhook signing secret, Hermes internal URL/token, runtime timeouts.
- Hermes: model/provider credentials and profile configuration.

Environment rules:
- Separate development, staging, and production values.
- Use separate Clerk development/staging/production instances and never reuse production secrets locally.
- Validate required variables at startup with Zod.
- No production defaults for secrets or database URIs.
- Hermes endpoint is internal-only.
- Deploy immutable images/artifacts.

Release sequence:
1. Back up/verify MongoDB.
2. Deploy API with backward-compatible model additions.
3. Verify live/ready endpoints and seed data.
4. Deploy Hermes runtime/profile and run health smoke.
5. Deploy web.
6. Run end-to-end smoke.
7. Monitor errors and funnel for 30 minutes.

Rollback:
- Roll back web and API to prior images.
- Keep model changes additive in the MVP to avoid destructive rollback migrations.
- Disable real Hermes and external job provider via configuration; deterministic fallback remains operational.

## 18. Production launch backlog after hackathon

### P0 before public launch
- Clerk production instance/domain configuration and verified route ownership enforcement.
- Signed Clerk lifecycle webhooks, account deletion propagation, and auth outage runbook.
- Resume deletion and retention controls.
- Rate limiting backed by shared storage if API has multiple replicas.
- Production monitoring and alerting.
- Managed secret storage and credential rotation.
- CI checks for test/lint/build and dependency vulnerabilities.
- Backup/restore verification.
- Terms/privacy copy and consent review.
- Load test expected launch traffic and Hermes concurrency.

### P1 first two weeks
- PDF/DOCX upload pipeline with object storage and malware scanning.
- Saved jobs and tailoring history UI.
- Job freshness/expiration and provider deduplication.
- Candidate feedback on recommendations.
- Prompt and ranking version dashboards.
- Cost/latency budgets and per-candidate quotas.
- Background queue for slow tasks if synchronous latency is problematic.

### P2 platform extraction after product validation
- Generic agent manifest and versioning.
- Agent builder UI.
- Per-agent profiles and deployment lifecycle.
- Tool/skill/MCP catalogs and approvals.
- Multi-tenant runtime isolation.
- One-agent-per-container production topology.
- Generic conversation streaming and normalized tool events.

Extraction trigger: build the generic platform only after at least two product agents need materially different user-configurable identities, tools, deployment lifecycles, or tenant isolation. Until then, fixed profiles and a narrow runtime adapter are faster and safer.

## 19. Risk register

| Risk | Likelihood/impact | Mitigation | Owner lane |
|---|---|---|---|
| Hermes server contract differs from assumptions | High/High | C1 spike first; fake runtime and fallback | C |
| External jobs API fails/rate-limits | High/High | Seed provider, adapter, idempotent sync | A/C |
| AI invents candidate facts | Medium/High | Strict prompt, schema, verified-facts-only fallback, fixture tests | C/D |
| Resume data leaks into logs | Medium/High | Structured redaction rules and log review | A/D |
| Scope expands into generic platform | High/High | Deferred P2 with explicit extraction trigger | All |
| Frontend blocked by backend | Medium/Medium | Freeze examples and build against fixtures | A/B |
| Mongo indexes/models drift | Medium/Medium | Model tests and additive changes | A/D |
| Tailoring latency hurts demo | Medium/Medium | Timeout, cache/input hash, fallback | A/C |
| Duplicate AI calls increase cost | Medium/Medium | Idempotency and disabled duplicate submits | A/B |
| Clerk configuration or middleware gap exposes candidate data | Medium/High | Server-side verification, ownership tests, separate environments, fail closed | A/D/E |
| Clerk outage blocks protected flows | Low/High | Clear error UX and provider status runbook; never bypass verification | D/E |

## 20. Task board template

Every parallel task should include:
- ID and lane.
- Exact files owned.
- Inputs/contracts it depends on.
- Output and acceptance criteria.
- Smallest verification command.
- Blocker/fallback decision.

Agent/subagent completion format:
1. Changed/found.
2. Paths touched or sources used.
3. Verification command and actual result.
4. Remaining blocker or next unblocked task.

Coordination rules:
- One owner per file at a time.
- Worktree isolation for independent coding agents.
- Main Hermes session owns contract changes and final integration.
- No subagent merges, commits, or pushes without explicit instruction.
- Rebase contract-dependent work only after the contract owner announces a freeze.
- Run the smallest relevant test after each merge, then full gates at milestones.

## 21. Immediate executable backlog

1. `A1` Freeze API schemas and sample payloads.
2. `E1` Complete and record the Clerk evaluation/go decision.
3. `C1` Run Hermes integration spike in parallel.
4. `E2` Create Clerk development/staging applications and configure secret stores.
5. `D3` Create sanitized seed jobs and one demo candidate.
6. `B1` Build typed client/types from frozen payloads.
7. `C2` Add runtime interface and fake implementation.
8. `A2` Add Mongoose models/indexes, including unique `clerkUserId`.
9. `E3/E4` Wire Clerk into Next.js and Express in parallel.
10. `A3` Complete authenticated PDF/DOCX extraction and candidate-persona persistence with explicit fallback.
11. `A4` Complete seed job provider and idempotent sync.
12. `A5` Complete/test deterministic ranking.
13. `B2–B4` Build protected UI against fixture responses in parallel.
14. `A6/C4` Integrate production Hermes resume parsing and tailoring; retain fake runtime only for tests/local fixtures.
15. `B5` Connect live API and finish degraded states.
16. `D1/D2/E5` Complete operational, authorization, and critical tests.
17. `D4/D5` Deploy staging and run authenticated full smoke.
18. Add `C5` Linkup only if all critical-path gates are green.

The first implementation milestone should be the offline deterministic vertical slice. This gives the team a reliable demo while the Hermes integration proceeds in parallel, and it provides the same service boundaries required for production hardening later.
