# Roles Platform: Backend Plan for Job Discovery + Profile Matching

> For Hermes: planning artifact only. No implementation in this step.

## Goal
Build a reliable backend system that continuously discovers fresh/relevant/unique job listings and matches them to user profiles (resume + metadata) with explainable, high-precision ranking.

## Why this is core
Today the API is in dummy mode with in-memory data (`apps/api/src/routes/index.ts`, `apps/api/src/data/dummyCareerData.ts`). The product value depends on replacing this with:
1) production-grade discovery,
2) canonicalized listings,
3) robust profile-job matching,
4) measurable quality loops.

## Non-negotiable constraints (governance)
1. Hermes must be the harness for all agent-related discovery/matching workflows in this project.
2. External AI/search services are allowed only through Hermes-managed workflows.
3. Linkup is the primary web discovery/search provider for openings, invoked via Hermes-run tasks/tools only.
4. No standalone non-Hermes agent runtime on the critical path.

## Current backend context snapshot
- API routes are currently dummy-backed:
  - `POST /ingest/profile`
  - `GET /recommendations/:userId`
  - `GET /jobs`, `GET /jobs/:jobId`
  - `POST /tailor-resume`, `POST /events`
- Source flag currently `source: 'dummy'`.
- Database exists in stack (`mongoose`) but not used when `DUMMY_API_MODE=true`.
- Existing test baseline is minimal (`apps/api/test/app.test.ts`).

## Target architecture (backend)

### A) Discovery pipeline (Linkup-first)
1. Discovery planner (agent step)
   - Input: role targets, locations, seniority, work mode, user demand signals.
   - Output: normalized Linkup query tasks.

2. Source fetch (Linkup)
   - Use Linkup `search_results` for broad recall.
   - Use Linkup `fetch_webpage` on selected URLs for detail extraction.
   - Optional: Linkup `search_structured_data` with strict schema for job fields.

3. Extraction + normalization
   - Normalize title/company/location/mode/salary/currency/postedAt/applyUrl/sourceUrl/sourceType.
   - Add scrape metadata: fetchedAt, queryId, sourceDomain, parserVersion.

4. Canonicalization + dedupe
   - Multi-key fingerprint:
     - normalized company + normalized title + normalized location + applyUrl/domain path hash.
   - Merge duplicates across sources into canonical opening record.
   - Keep source_variants array for auditability.

5. Quality filters
   - Drop stale postings (configurable TTL by source type).
   - Drop low-confidence extraction (missing title/company/apply URL).
   - Block invalid/unsafe domains via allowlist/denylist.

6. Storage + indexing
   - Collections:
     - `job_openings_raw`
     - `job_openings_canonical`
     - `discovery_runs`
   - Indexes for fast retrieval:
     - postedAt desc
     - title/location/mode
     - skill tokens
     - fingerprint unique index

### A.1) Cross-channel hidden-opportunity discovery strategy (new)
Goal: discover openings that are poorly marketed or not visible on mainstream aggregators.

1. Seed channels (high intent)
   - Explicit target companies provided by user.
   - Company career pages discovered from brand + "/careers" + "/jobs" patterns.

2. ATS channel expansion
   - Scan ATS-hosted listings where many teams publish jobs before broad distribution:
     - Greenhouse, Lever, Workday, Ashby, SmartRecruiters.
   - Build ATS-specific query templates by role/location/seniority and normalize to canonical schema.

3. Search-engine reconnaissance
   - Generate discovery queries intended for web search APIs (Google-style intent) and run via Hermes-governed provider calls.
   - Pattern examples:
     - `site:jobs.lever.co "<role>" "<location>"`
     - `site:boards.greenhouse.io "<role>"`
     - `"<company>" "is hiring" "<skill>"`
   - Prioritize newly indexed pages and pages with direct apply links.

4. Community and long-tail channel expansion
   - Startup ecosystems, portfolio-company job boards, niche communities, and regional boards.
   - Treat these as secondary recall channels with stricter quality filtering.

5. Unified canonicalization across all channels
   - Every discovered record carries `sourceChannel`, `sourcePlatform`, `sourceUrl`, `discoveryQuery`.
   - Deduplicate aggressively so one opening appears once in user recommendations.

6. Channel-level quality telemetry
   - Track yield per channel: fetched -> valid -> canonical -> recommended.
   - Auto-downrank noisy channels and upweight channels producing fresh/high-conversion openings.

### B) Matching pipeline (profile -> ranked jobs)
1. Profile feature build
   - Input: resume text, LinkedIn URL (if available), user meta (target role/location/mode).
   - Scrape LinkedIn/profile URLs through Linkup `fetch_webpage` (Hermes-governed harness) before feature extraction.
   - Output profile vector:
     - skill taxonomy tags
     - years/seniority band
     - domain/industry signals
     - preferred constraints.

2. Job feature build
   - Parse must-have/nice-to-have skills, seniority hints, location/mode constraints.
   - Maintain both lexical features and embeddings.

3. Two-stage retrieval
   - Stage 1 (candidate generation):
     - hard filters: location/mode/work authorization constraints.
     - lexical BM25/keyword retrieval over title/description/skills.
   - Stage 2 (re-ranking):
     - embedding similarity + rule-based score + business boosts.

4. Final ranking formula (explainable)
   - `final_score = 0.35*semantic + 0.30*skills_overlap + 0.20*constraints_fit + 0.10*freshness + 0.05*source_quality`
   - Store component scores for transparency and UI explanations.

5. Explanation generation
   - For each recommendation, return:
     - top match reasons (derived from component scores)
     - keyword gaps
     - hard constraints satisfied/failed.

6. Persistence
   - Save recommendation snapshots per user request with model/version tags:
     - `recommendations` collection
     - fields: scoringVersion, embeddingModelVersion, discoveryRunIds, generatedAt.

## Fresh, relevant, unique: explicit strategies

### Fresh
- Scheduled incremental discovery every 30-60 minutes by priority segment.
- Re-crawl hot queries more frequently (high traffic roles).
- Freshness decay in ranking after configurable age thresholds.
- Dead-link and expired-job checks; auto-retire unavailable postings.

### Relevant
- Query planner includes user demand telemetry (search terms, clicked jobs, applied jobs).
- Skill ontology expansion (synonyms: "Node.js" <-> "Node", "TS" <-> "TypeScript").
- Geo and mode-aware ranking (remote/hybrid/onsite as hard preference knobs).
- Feedback loop: positive/negative user interactions adjust future ranking priors.

### Unique
- Strong canonical fingerprints + near-duplicate text similarity checks.
- One canonical job per opening in recommendations list (no repeated source mirrors).
- Diversity constraints in top-N (avoid same company/title clusters dominating).

## Agent tooling best practices (applied to this problem)
1. Deterministic tool contracts
   - Every discovery/matching agent step uses strict JSON schemas.
   - Reject partial/ambiguous outputs early.

2. Idempotent jobs
   - Discovery runs can be retried safely; upserts keyed by fingerprint.

3. Separation of responsibilities
   - Planner agent (query generation)
   - Fetcher/extractor worker
   - Matcher/ranker worker
   - Evaluator worker (quality metrics)

4. Human-debuggable traces
   - Persist per-run trace payloads: query -> source URLs -> extracted records -> dedupe decisions -> ranked output.

5. Evaluation before rollout
   - Offline benchmark set of labeled profile-job pairs.
   - Gate scoring changes behind metric thresholds.

6. Version everything
   - parserVersion, scoringVersion, embeddingVersion, taxonomyVersion in every record.

7. Fail-safe degradation
   - If Linkup is unavailable: return last successful canonical index + explicit stale marker.

## Linkup integration plan (backend)

### Required integration principle
All Linkup usage is initiated through Hermes-managed workflows (per governance).

### Runbook-level actions
1. Define Linkup action wrapper in backend service layer:
   - `searchResults(query, depth, domains?)`
   - `fetchWebpage(url)`
   - `searchStructuredData(query, schema)`
2. Add strict Zod schemas for request/response mapping.
3. Add provider health checks and credit checks pre-run.
4. Add adaptive query strategy:
   - broad query -> shortlist domains -> detail fetch.
5. Add backoff/retry and rate limiting controls.

### Note from current environment
- `oo` CLI is not currently installed in this environment.
- Community Linkup skill installation was blocked by security scanner.
- Implementation should therefore use first-party Linkup API/service wiring inside the backend (still under Hermes-governed execution) rather than relying on blocked third-party skill installer paths.

## Data model blueprint (MongoDB)

### `job_openings_canonical`
- `_id`
- `fingerprint` (unique)
- `title`, `company`, `location`, `mode`
- `description`, `skills_required[]`, `skills_preferred[]`
- `salary_min`, `salary_max`, `currency`
- `posted_at`, `last_seen_at`, `is_active`
- `apply_url`, `source_url`, `source_domains[]`
- `freshness_score`, `source_quality_score`
- `embedding_vector_ref`
- `parser_version`, `canonical_version`

### `job_openings_raw`
- raw payload, source metadata, extraction confidence, parse errors

### `user_profile_features`
- `user_id`
- normalized skills, experience band, preferred constraints
- profile embedding refs
- `feature_version`, `updated_at`

### `recommendations`
- `user_id`, `job_id`, `final_score`
- component scores + reasons + keyword gaps
- `scoring_version`, `generated_at`, `discovery_run_ids[]`

### `discovery_runs`
- run id, query plan, Linkup call logs, counts (fetched/accepted/merged/dropped), error summary, duration

## API evolution plan (from current routes)
1. Keep existing route shapes for frontend compatibility.
2. Introduce service layer under `apps/api/src/services/`:
   - `discoveryService.ts`
   - `canonicalizationService.ts`
   - `matchingService.ts`
   - `recommendationService.ts`
3. Add background jobs under `apps/api/src/jobs/`:
   - `runDiscovery.ts`
   - `refreshEmbeddings.ts`
   - `retireStaleJobs.ts`
4. Extend routes:
   - `POST /discovery/run` (internal/admin)
   - `GET /jobs` served from canonical store
   - `GET /recommendations/:userId` from live ranking or cached snapshot

## Execution phases (backend-first)

### Phase 0: Foundation (1-2 days)
- Create Mongo schemas + indexes for canonical/raw/runs/recommendations/profile features.
- Move dummy logic behind a repository interface.
- Add feature flag: dummy vs live discovery/matching.

### Phase 1: Discovery MVP with Linkup (2-3 days)
- Implement query planner + Linkup fetch wrappers.
- Build normalization + dedupe + canonical upserts.
- Add run logs and health metrics.

### Phase 2: Matching MVP (2-3 days)
- Build profile/job feature extraction.
- Implement two-stage retrieval + explainable scoring.
- Return reasons and keyword gaps from score decomposition.

### Phase 3: Quality + feedback loop (2 days)
- Interaction ingestion to ranking signals.
- Freshness/uniqueness KPIs dashboard.
- Offline evaluation job and threshold-based release gates.

## KPIs to track from day 1
- Discovery freshness: % active jobs seen in last 24h.
- Uniqueness: duplicate rate in canonical store and in top-N recs.
- Relevance: CTR on recommended jobs, save/apply conversion.
- Coverage: avg # relevant jobs per active user profile.
- Latency: p95 recommendation generation time.
- Reliability: failed Linkup runs, parse failure ratio.

## Testing and validation strategy

### Unit tests
- Query builder logic
- Normalization and fingerprint generation
- Dedup merge rules
- Score component calculations

### Integration tests
- Linkup wrapper contract tests (mocked responses + failure modes)
- Canonicalization pipeline end-to-end
- Recommendation endpoint returns stable shape + explanations

### Offline eval tests
- Labeled fixtures: profile-job relevance pairs
- NDCG@K / Precision@K before and after scoring changes

### Operational validation
- Dry-run discovery in shadow mode for 48h before full switch.
- Compare live quality metrics against dummy baseline.

## Risks and mitigations
1. Noisy extraction from heterogeneous job pages
   - Mitigation: schema validation + confidence thresholds + source allowlist.
2. Duplicate explosion across job boards
   - Mitigation: fingerprint + similarity merge + canonical-only recommendation policy.
3. Cold-start relevance for new users
   - Mitigation: default role packs + popularity prior + onboarding constraints.
4. Linkup quota/rate limits
   - Mitigation: query prioritization, caching, scheduled windows, retry budget.
5. Opaque ranking decisions
   - Mitigation: score decomposition persisted and surfaced.

## Immediate next 5 backend tasks
1. Define Mongo schemas/repositories for canonical jobs and recommendations.
2. Implement deterministic fingerprint + dedupe module with tests.
3. Implement Linkup adapter interface + mockable contract tests.
4. Replace `buildRecommendations(...)` with service-based candidate retrieval + scoring.
5. Add run telemetry (`discovery_runs`) and expose internal health counters.

## Files expected to change in implementation phase
- `apps/api/src/routes/index.ts`
- `apps/api/src/config/env.ts`
- `apps/api/src/config/database.ts`
- `apps/api/src/services/*` (new)
- `apps/api/src/models/*` (new)
- `apps/api/src/jobs/*` (new)
- `apps/api/test/*` (expanded)

## Open questions to confirm before implementation
1. Which geographies and role families are in-scope for first launch?
2. Do we require strict hard filters on visa/work authorization now or later?
3. What is acceptable recommendation latency SLA (p95)?
4. Do we want real-time recommendations on every request or periodic precomputed snapshots?
5. What are initial Linkup budget/credit constraints?
