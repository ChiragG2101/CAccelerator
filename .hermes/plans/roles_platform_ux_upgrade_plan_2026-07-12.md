# Roles Platform UX Upgrade Plan (Post skill/tool switch)

## 1) Goal and UX principles
Goal: convert the current basic demo UI into a polished, confidence-building candidate journey that feels product-grade while preserving sprint velocity.

Principles:
- One primary CTA per viewport.
- Explain AI outputs (why this match, what changed in tailoring).
- Fast perceived performance (skeletons + progressive status).
- Never dead-end (empty/error/retry paths everywhere).
- Keep implementation thin and replaceable (MVP sprint mode).

## 2) Core journey (golden path)
Landing -> Onboarding -> Analyzing -> Recommendations -> Job Detail -> Tailor Resume -> Apply/Export

Current implementation exists for all stages but lacks stronger hierarchy, trust cues, and conversion-focused information architecture.

## 3) Information architecture updates required
A) Landing
- Keep only one primary action: "Start profile analysis".
- Demote "View demo recommendations" to secondary/ghost action.
- Add social proof/trust strip + concise "How it works" with outcomes.

B) Onboarding
- Split into 2-step progressive form:
  1. Profile source (resume/linkedin/manual)
  2. Target preferences (role/location/work mode)
- Add completeness meter and inline helper text.

C) Recommendations dashboard
- Add top filter rail: role, work mode, score band, location.
- Add sort options: Best fit (default), Newest, Compensation.
- Add saved/shortlisted state and compare mode.

D) Job detail + tailoring
- Add "Match breakdown" section (skills overlap vs keyword gaps).
- Add visible "What we changed" rationale next to tailored output.
- Add explicit next actions: Copy, Download, Open application.

## 4) Visual direction and tokens
Current style is clean dark but visually flat. Upgrade tokens:
- Elevation tiers: card/raised/modal with differentiated shadows.
- Semantic color scale for match score (high/mid/low).
- Consistent spacing rhythm (4/8/12/16/24/32).
- Type scale reinforcement:
  - Display 44/52
  - H1 32
  - H2 24
  - Body 16
  - Caption 13
- Motion tokens:
  - 150ms hover/press
  - 220ms panel transitions
  - reduce-motion fallback

## 5) Tool-assisted inspiration workflow (with MCP status)
Installed/available now:
- Skills installed for landing/UX support:
  - landing-page (skills-sh/jezweb/claude-skills/landing-page)
  - landing (skills-sh/alirezarezvani/claude-skills/landing)
- Local UX skills already available and loaded:
  - ux-flow-planning
  - nextjs-ux-with-mock-api
  - popular-web-designs
  - claude-design
- MCP:
  - linear MCP installed and enabled (OAuth pending interactive login).

Requested MCP status:
- "move-in" and "mobbin" are not in the current Hermes MCP catalog in this environment.
- Fallback approach: use popular-web-designs + claude-design workflow for landing/dashboard patterns, then track execution as issues via Linear MCP once authenticated.

## 6) Screen-by-screen UX specs
1. Landing (`apps/web/src/app/page.tsx`)
- Hero with stronger value prop and one primary CTA.
- Add proof row: outcomes, speed, transparency chips.
- Add before/after mini preview of tailored resume quality.

2. Onboarding (`apps/web/src/app/onboarding/page.tsx`)
- Convert single long form to stepper UI with sticky progress header.
- Add contextual microcopy and validation states.
- Add "Use demo profile" quick action.

3. Recommendations (`apps/web/src/components/RecommendationsClient.tsx`, `RecommendationCard.tsx`)
- Add filter/sort toolbar above results.
- Card redesign:
  - clearer match score block
  - reason chips grouped by category
  - keyword gaps collapsed/expandable
- Add empty states by scenario (no data vs no matching roles vs API failure).

4. Recommendation detail (`RecommendationDetailClient.tsx`)
- Two-column layout with sticky action rail.
- Job requirements grouped into Must-have / Nice-to-have.
- Tailor button becomes primary persistent CTA.

5. Tailor output (`TailorPanel.tsx`)
- Add diff view tabs: "Original vs Tailored" + "Why changed".
- Add export actions (copy markdown, plain text, pdf-ready text).
- Add post-tailor feedback control (helpful/not helpful).

6. Global states/components
- Expand and standardize:
  - loading skeletons
  - contextual errors with retry
  - empty guidance states
  - lightweight toast system

## 7) Accessibility + performance checklist
- Keyboard traversal for all actionable controls.
- Focus-visible rings and landmarks per page.
- Color contrast WCAG AA on dark surfaces.
- ARIA labels for score/meter controls.
- Avoid layout shift in cards and detail pane.
- Keep above-the-fold payload minimal; stream/defers where possible.

## 8) Implementation mapping (repo paths)
Primary files to update:
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/onboarding/page.tsx`
- `apps/web/src/components/RecommendationsClient.tsx`
- `apps/web/src/components/RecommendationCard.tsx`
- `apps/web/src/components/RecommendationDetailClient.tsx`
- `apps/web/src/components/TailorPanel.tsx`
- `apps/web/src/app/globals.css`

New components suggested:
- `apps/web/src/components/FilterBar.tsx`
- `apps/web/src/components/ScoreBreakdown.tsx`
- `apps/web/src/components/ProgressStepper.tsx`
- `apps/web/src/components/ToastHost.tsx`
- `apps/web/src/components/MatchRationale.tsx`

## 9) 3-4 hour sprint breakdown
Hour 1:
- Landing hierarchy refresh + token cleanup in globals.
- Add reusable button/chip/score semantic classes.

Hour 2:
- Onboarding stepper + progress + improved validation/microcopy.

Hour 3:
- Recommendations toolbar + upgraded recommendation cards.

Hour 4:
- Job detail/tailor panel UX pass + global error/empty/loading consistency.

## 10) Pilot validation script and measurable thresholds
Pilot script (5 users):
1. Start from landing and complete onboarding.
2. Identify top recommendation and explain "why" in their own words.
3. Tailor resume and copy output for one job.
4. Open application link and report confidence to apply.

Success thresholds:
- >=80% complete onboarding in <3 minutes.
- >=80% can correctly describe match rationale.
- >=70% perceive tailored output as immediately usable.
- <=10% hard-drop from recommendations -> detail due to confusion.

## Immediate next execution slice
Ship first: landing CTA hierarchy + recommendations filter/sort + clearer match rationale on cards.
This gives the biggest visible UX lift with minimal backend change.
