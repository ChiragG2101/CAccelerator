# Roles Platform UX/UI Redesign Plan (MVP Sprint)

Date: 2026-07-12
Product: Roles Platform (apps/web)
Goal: Upgrade from basic demo UI to a modern, professional, trustworthy job platform UX that is intuitive end-to-end.

## 1) Goal and UX principles

### Redesign goal
Make the platform feel credible enough that a candidate would trust it for real job discovery and resume tailoring in under 2 minutes.

### UX principles
1. Clarity over novelty: every screen answers “what should I do next?”
2. One primary CTA per view
3. Strong trust signals early (verified jobs, transparent match reasons, salary/location clarity)
4. Progressive disclosure (summary first, details on demand)
5. Fast scan patterns (chips, sections, predictable cards)
6. Design consistency via tokens (color/type/spacing)
7. MVP-safe: polished critical path first (Onboarding → Recommendations → Tailor)

## 2) Core journey (golden path)

1. Landing
   - User immediately understands value proposition
   - Primary CTA: Start profile
   - Secondary CTA: View sample jobs

2. Onboarding/profile input
   - Paste resume or LinkedIn + role/location preferences
   - Instant validation and confidence hints
   - Submit → recommendations

3. Recommendations list
   - Search/filter/sort + high-signal cards
   - Transparent match score and reasons
   - Quick actions: View details / Apply / Tailor

4. Recommendation detail + tailoring
   - Job context + skills + keyword gaps + compensation
   - Tailor resume
   - Copy/export and apply CTA

5. Completion loop
   - Track status or go back to recommendations
   - Save filters/preferences for next session (phase 2)

## 3) Information architecture

### Primary navigation (top)
- Find Jobs
- How It Works
- For Employers (placeholder MVP)
- Sign in
- Get Started (primary)

### Landing sections (new order)
1. Hero: value proposition + search teaser + primary CTA
2. Social proof row: known companies / stats
3. “How it works” 3-step section
4. Featured roles (curated cards)
5. Why trust this platform (transparent matches, no spam, quality roles)
6. Final CTA band
7. Footer with policy/support links

### App pages
- `/` (conversion landing)
- `/onboarding` (profile setup)
- `/recommendations` (discovery + ranking)
- `/recommendations/[jobId]` (detail + tailoring)

## 4) Visual direction and design tokens

### Visual blend to target
- Base style: Vercel/Linear cleanliness (high contrast, restrained surfaces)
- Human warmth: Airbnb-style spacing softness and approachable microcopy
- Marketplace clarity: Stripe Jobs-style list/filter structure
- Landing storytelling: Welcome to the Jungle section rhythm

### Color palette (professional + eye-catching, not noisy)

#### Option A (recommended): Midnight + Indigo + Teal confidence
- Background:
  - `--bg-0: #070A13`
  - `--bg-1: #0D1324`
  - `--bg-2: #151D34`
- Text:
  - `--text-strong: #F8FAFC`
  - `--text-mid: #CBD5E1`
  - `--text-muted: #94A3B8`
- Brand:
  - `--brand-500: #6366F1` (indigo)
  - `--brand-600: #4F46E5`
  - `--brand-300: #A5B4FC`
- Accent/support:
  - `--success: #10B981`
  - `--warning: #F59E0B`
  - `--danger: #F43F5E`
  - `--info: #06B6D4`
- Borders/surfaces:
  - `--border-soft: rgba(148,163,184,0.25)`
  - `--surface-glass: rgba(15,23,42,0.65)`

Rationale: maintains premium dark mode while making CTAs/pop states more vivid and modern.

### Typography
- Primary font: Inter (or Geist if preferred)
- Optional display accent: Manrope for hero only
- Scale:
  - Hero H1: 52/60, weight 700
  - H2: 36/44, weight 650
  - H3: 24/32, weight 600
  - Body: 16/26, weight 400
  - Small/meta: 13/20, weight 500
- Tight but readable tracking; avoid over-condensed headline letterspacing.

### Component style
- Radius: 12 (inputs/buttons), 16 (cards), 24 (hero blocks)
- Shadows: subtle layered depth, avoid heavy blur
- Buttons:
  - Primary: solid indigo
  - Secondary: outline with low-contrast border
  - Tertiary: text link
- Chips:
  - Match reasons (brand tint)
  - Gaps (warning tint)
  - Remote/hybrid/onsite (neutral semantic chips)

## 5) Inspiration research summary used

### Job and career experiences reviewed
1. Welcome to the Jungle (Otta transition)
   - Strong section-based storytelling
   - Benefit-led copy and repeated conversion points
2. Stripe Jobs
   - High-trust, structured listing UX (search + filters + table hierarchy)
   - Excellent scanability for large result sets
3. Remote.com jobs
   - Curated category shelves + dense, decision-ready job cards

### Design systems and landing references reviewed
4. Linear
   - Premium dark-mode discipline, clean spacing, restrained accent usage
5. Vercel
   - Minimal chrome, clear CTA hierarchy, crisp typography
6. Popular design system templates loaded (Linear/Stripe/Vercel/Airbnb)
   - Token-level guidance for type/spacing/colors

### Notes on requested sources
- Google Search was attempted but blocked by anti-bot interstitial in this environment.
- “Mobin/Mobbin MCP” is not currently installed/configured in this Hermes environment (`hermes mcp catalog` + `hermes mcp list` checked).
- Fallback used: direct website reference analysis + design-system templates.

## 6) Screen-by-screen UX specs

### A. Landing (`/`)
Objective: convert first-time user to onboarding.

Must include:
- Hero title + concise subcopy
- Primary CTA: “Get matched jobs”
- Secondary CTA: “See sample recommendations”
- Search-like teaser input row (role/location)
- Trust strip (companies/metrics)
- 3-step how-it-works cards
- Featured jobs carousel/grid preview

States:
- Loading: skeleton for featured jobs
- Empty: fallback static featured cards
- Error: non-blocking warning + retry fetch

### B. Onboarding (`/onboarding`)
Objective: complete profile with confidence.

Improvements:
- Convert raw form into progressive sections:
  1) Profile source (resume/linkedin)
  2) Preferences (role/location)
  3) Review and submit
- Sticky progress indicator “Step 1 of 3”
- Inline validation messages (not only top-level)
- Input helper text/examples

States:
- Loading: submit button loader + disabled form
- Empty: guidance prompt if no resume/linkedin
- Error: inline field + banner errors
- Success: route transition with optimistic confirmation

### C. Recommendations list (`/recommendations`)
Objective: quickly find best roles and move to tailor/apply.

Improvements:
- Add filter row: keyword, location, mode, salary range, sort
- Result summary: “42 matching roles” + clear filters
- Card redesign:
  - Title/company/location/mode
  - Salary and posted date visible
  - Match score + top reasons
  - Keyword gaps (collapsed after 3)
  - Primary CTA: Tailor resume
  - Secondary CTA: View job/apply

States:
- Loading: list skeletons
- Empty: clear guidance + “Edit profile” and “Reset filters”
- Error: retry card with fallback suggestions

### D. Recommendation detail (`/recommendations/[jobId]`)
Objective: make tailoring decision frictionless.

Improvements:
- Two-column layout (desktop): job detail left, tailor panel right
- Sticky right panel with “Tailor resume” and copy/export actions
- Sectioned detail:
  - Responsibilities
  - Must-have skills
  - Salary/location/type
  - Why matched / missing keywords
- Add confidence and timestamp metadata

States:
- Loading: section skeletons
- Error: retry + back to list
- Success: tailored output card with copy feedback toast

## 7) Accessibility and performance checklist

### Accessibility
- Contrast: WCAG AA minimum for text and controls
- Keyboard-first focus states on all actionable elements
- Semantic headings and landmarks
- Form labels + helper text + error association
- Non-color-only status indicators

### Performance
- Keep hero and listing images optimized (next/image)
- Use skeletons rather than layout shifts
- Cache static sections, no-store only where needed
- Keep first-load interaction simple (defer non-critical animation)

## 8) Implementation mapping (repo-specific)

### Existing files to update
- `apps/web/src/app/page.tsx` (complete landing restructure)
- `apps/web/src/app/onboarding/page.tsx` (multi-section form UX)
- `apps/web/src/app/recommendations/page.tsx` (toolbar + summary states)
- `apps/web/src/components/RecommendationsClient.tsx`
- `apps/web/src/components/RecommendationCard.tsx`
- `apps/web/src/components/RecommendationDetailClient.tsx`
- `apps/web/src/components/TailorPanel.tsx`
- `apps/web/src/app/globals.css` (global tokens/utilities)
- `apps/web/tailwind.config.ts` (new semantic token mapping)

### New components recommended
- `apps/web/src/components/NavBar.tsx`
- `apps/web/src/components/HeroSearchBar.tsx`
- `apps/web/src/components/TrustStrip.tsx`
- `apps/web/src/components/FilterToolbar.tsx`
- `apps/web/src/components/MatchScoreBadge.tsx`
- `apps/web/src/components/InlineFieldError.tsx`

## 9) 3-4 hour sprint implementation plan (next step)

Phase 1 (60-75 min): Foundation
- Introduce color/type tokens in Tailwind + globals
- Create NavBar + shared button/chip style utilities
- Upgrade landing hero and section rhythm

Phase 2 (60-75 min): Recommendations UX
- Implement filter toolbar and result summary
- Redesign recommendation card hierarchy
- Add loading/empty/error improvements

Phase 3 (45-60 min): Detail + tailoring polish
- Two-column detail layout
- Improve tailor panel hierarchy and copy/export feedback

Phase 4 (30-40 min): QA and fit/finish
- Run `pnpm run lint`
- Run `pnpm run build`
- Adjust responsive spacing and contrast

## 10) Pilot validation script (usability)

Run with 5 pilot users. Target completion in <2 minutes.

Tasks:
1. Start from landing and get to recommendations.
2. Identify the best matching role and explain why.
3. Tailor a resume and copy the output.
4. Return to recommendations and adjust filters.

Success thresholds:
- 80%+ users complete task 1 in <90s
- 80%+ users correctly identify next primary action on every screen
- 0 critical confusion events on onboarding submit
- Perceived trust score >= 4/5

---

This plan is implementation-ready for the current Next.js/Tailwind codebase and focuses on thin-slice polish across the critical path first.