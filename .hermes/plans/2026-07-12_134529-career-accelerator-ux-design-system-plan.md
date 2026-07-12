# Career Accelerator UX Plan (Clean, Simple, Modern)

> For Hermes: planning-only artifact for UX + UI direction. Optimized for a 3–4 hour build sprint and immediate pilot testing.

Goal: Design an intuitive end-to-end candidate flow (ingest profile -> discover relevant jobs -> tailor resume per job -> apply) that feels trustworthy, fast, and modern with minimal cognitive load.

Architecture: Use a linear 4-step experience with progressive disclosure. Keep one primary CTA per screen, context-aware secondary actions, and clear status feedback. Implement with reusable Tailwind components and lightweight state transitions.

Tech stack: Next.js App Router, Tailwind CSS, existing Node/Prisma API, optional Mobbin inspiration workflow + Figma wireframe/prototype workflow.

---

## 1) UX north star

Product promise to user:
"Share your profile once. Get relevant jobs instantly. Tailor your resume per job in one click."

UX principles:
1. Clarity over novelty (simple copy, obvious next step)
2. Speed as trust (visible progress + fast feedback)
3. Explainability (show why each job is recommended)
4. No dead ends (fallback path on every external dependency)
5. Actionable outputs (copy-ready tailored content)

Tone:
- Professional, encouraging, non-hype
- Avoid jargon like "semantic ranking" in UI
- Use plain text: "Matched because your React + Node experience fits this role"

---

## 2) Core user journey (single golden path)

Step 1: Onboarding
- Inputs: Resume text/upload, LinkedIn URL (optional), target role, location
- CTA: "Analyze my profile"
- Success output: profile summary chips (skills, experience band, target role)

Step 2: Recommendations
- List of top jobs with score, reason, missing keywords
- CTA per card: "Tailor resume"
- Secondary: "View job"

Step 3: Tailor output
- Generates tailored headline/summary/bullets/keywords
- CTA: "Copy tailored resume"
- Secondary: "Regenerate" and "Open job application"

Step 4: Apply tracking (lightweight)
- User clicks "Apply"
- System logs action and prompts: "Did you apply?" (optional)

---

## 3) Information architecture and navigation

Top nav (minimal):
- Logo (left)
- Dashboard / Recommendations
- Profile
- History (optional in MVP)

Primary IA:
- `/` landing + CTA
- `/onboarding`
- `/recommendations`
- `/recommendations/[jobId]`
- `/tailor/[jobId]` (or same job detail with panel)

Avoid deep nesting for MVP.

State model per route:
- loading
- empty
- success
- error + retry

All pages must explicitly define all 4 states.

---

## 4) Visual direction (inspiration synthesis)

Based on modern SaaS references and your current dark theme foundation, use a hybrid style:
- Layout discipline similar to Vercel/Linear
- Warm readability and content spacing from Notion-like editorial clarity
- Existing repo palette anchor: slate dark + brand violet (`brand-500..700`)

Design tokens (starting set):
- Background: `slate-950`
- Surface: `slate-900/60`
- Border: `slate-700/60`
- Primary text: `slate-50`
- Secondary text: `slate-300`
- Accent: `brand-500`
- Accent hover: `brand-400`
- Success: emerald-400
- Warning: amber-300
- Danger: rose-400

Type scale:
- H1: text-3xl md:text-4xl font-semibold
- H2: text-2xl font-semibold
- Body: text-base text-slate-200
- Meta: text-sm text-slate-400

Spacing rhythm:
- 8px base unit
- section paddings: 24/32/48
- card radius: 16px
- control radius: 10–12px

Motion:
- 150–200ms easing transitions
- no spring-heavy effects
- skeleton loaders on async fetches

---

## 5) Mobbin-driven inspiration workflow (practical)

I can access Mobbin web content from this environment, but I don’t have a direct dedicated Mobbin MCP tool here. Use this workflow with your Mobbin account to keep research efficient:

A) Capture 12–18 references total
- Onboarding forms: 4
- Job/result lists: 4
- AI generation output screens: 4
- Empty/error/loading states: 4–6

B) Pattern extraction sheet
For each reference, capture:
- screen purpose
- layout pattern (single column / split)
- CTA hierarchy
- error handling style
- trust elements (badges, explanations)

C) Decision output
Choose one base pattern per stage:
- onboarding pattern
- recommendations list pattern
- detail + action pattern
- generation result pattern

D) Anti-patterns to avoid
- more than one primary CTA per viewport
- dense cards with no hierarchy
- hidden score explanations
- long forms without progress feedback

---

## 6) Figma workflow (fast setup for your team)

I don’t have a Figma MCP tool exposed directly in this session, so here is the exact project structure to execute in Figma quickly.

File structure:
1. Page: `00_Foundations`
   - color tokens
   - type scale
   - spacing and radius tokens
2. Page: `01_Components`
   - buttons, input, chips, cards, status badges, skeletons
3. Page: `02_Flows`
   - onboarding flow
   - recommendation flow
   - tailoring flow
4. Page: `03_Prototype`
   - clickable prototype for pilot testing

Essential components to build first (order):
1. `Button/Primary`, `Button/Secondary`, `Button/Ghost`
2. `Input/Text`, `Input/Textarea`, `Input/URL`, `Input/File`
3. `Card/JobRecommendation`
4. `Card/TailorOutput`
5. `Chip/Skill`, `Chip/KeywordGap`
6. `Banner/Error`, `Banner/Info`
7. `State/LoadingSkeleton`

Prototype links to wire:
- Landing CTA -> Onboarding
- Submit onboarding -> Recommendations
- Tailor click -> Tailor result
- Apply -> external link state

Pilot script in Figma (15 min):
- Ask 3 users to complete prototype with think-aloud
- Track where they hesitate > 3s
- Revise copy/CTA labels immediately

---

## 7) If you want ultra-fast wireframes instead of full Figma

Use a low-fidelity wireframe tool (e.g., paper.design style flow or simple grayscale wireframes) first, then skin in Tailwind.

Wireframe rule set:
- grayscale only
- no final copy polish in v1
- focus on hierarchy, spacing, and CTA order
- validate flow in 30 minutes before visual styling

Minimum wireframes to create:
1. Landing + value proposition
2. Onboarding form
3. Recommendations list
4. Job detail + tailor action
5. Tailor result output
6. Empty and error states

---

## 8) Screen-by-screen UX specs

### Screen A: Landing
Objective: push qualified users into onboarding quickly.

Layout:
- hero headline + trust subtitle
- 3-step visual strip (Upload -> Match -> Tailor)
- single CTA: "Get matched jobs"

Trust blocks:
- "Takes 2–3 minutes"
- "You can edit profile before generating"

### Screen B: Onboarding
Objective: capture enough data without overwhelming.

Form structure:
- Resume upload/text input
- LinkedIn URL optional
- Target role
- Preferred location / remote toggle

UX details:
- show inline validation only on blur/submit
- show progress text: "Step 1 of 2"
- submit button disabled until minimum required fields

### Screen C: Recommendations
Objective: make top matches obvious and explainable.

Card anatomy:
- title/company/location
- match score badge (e.g., 86%)
- reason chips ("React", "Node", "B2B SaaS")
- keyword gaps (max 3 visible + "+2")
- CTA: "Tailor resume"
- secondary: "View job"

Filters (simple):
- score threshold
- location
- role keyword

### Screen D: Job detail + tailoring trigger
Objective: decision confidence before tailoring.

Sections:
- job overview
- why this is a fit
- missing skills summary
- CTA: "Tailor resume for this job"

### Screen E: Tailored output
Objective: give immediately usable result.

Blocks:
- tailored summary
- tailored experience bullets
- keywords to include
- warnings (if missing critical must-have)

Actions:
- copy all
- regenerate
- open apply link

### Screen F: Error and fallback
Objective: keep user moving.

Error examples:
- LinkedIn fetch failed -> "Add manual summary instead"
- Tailoring timed out -> "Retry" + "Use quick template"

---

## 9) UX copy system (microcopy)

Primary button labels:
- Analyze my profile
- Show my best matches
- Tailor resume
- Copy tailored resume
- Open application

Explainability strings:
- "Matched because your X and Y skills align with this role"
- "Add these keywords to improve ATS fit"

Error strings:
- "Couldn’t parse this file. Paste resume text to continue."
- "We couldn’t fetch LinkedIn details right now. You can continue manually."

Success strings:
- "Profile analyzed. Here are your top matches."
- "Tailored version ready."

---

## 10) Accessibility and usability checklist

Must-have:
- contrast >= WCAG AA
- keyboard focus states visible on all controls
- labels tied to inputs
- ARIA for dynamic status messages
- avoid color-only status communication

Performance UX:
- recommendation list render < 2s perceived (with skeletons)
- tailor generation shows progress state within 300ms
- never block UI without feedback

---

## 11) Frontend implementation mapping (repo-specific)

Modify:
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/lib/types.ts`

Create:
- `apps/web/src/app/onboarding/page.tsx`
- `apps/web/src/app/recommendations/page.tsx`
- `apps/web/src/app/recommendations/[jobId]/page.tsx`
- `apps/web/src/components/ResumeUpload.tsx`
- `apps/web/src/components/LinkedInInput.tsx`
- `apps/web/src/components/RecommendationCard.tsx`
- `apps/web/src/components/TailorPanel.tsx`
- `apps/web/src/components/StateSkeleton.tsx`
- `apps/web/src/components/StateError.tsx`
- `apps/web/src/components/StateEmpty.tsx`

Optional design reference artifact:
- `apps/web/design/wireframes/ux-flow-v1.fig` (manual export)
- or `apps/web/design/wireframes/lowfi-flow-v1.pdf`

---

## 12) 3–4 hour UX sprint plan (team of 3)

0:00–0:30
- lock flows, copy, component inventory

0:30–1:30
- low-fi wireframes (all 6 key screens)
- validate CTA hierarchy

1:30–2:30
- high-fi styling pass + component tokens
- define loading/empty/error states

2:30–3:30
- clickable prototype + 3 pilot tests
- apply copy/layout fixes

3:30–4:00
- engineer handoff checklist + backlog for v2

---

## 13) Pilot test script (very short)

Task prompts:
1. "Upload profile and get job matches"
2. "Choose one job and tailor your resume"
3. "Tell us if you would apply with this result"

Measure:
- time to first match list
- confusion points
- trust in match reasons (1–5)
- trust in tailored output (1–5)
- intent to apply (yes/no)

Success threshold:
- >=70% users complete full flow without assistance
- average trust score >=4/5

---

## 14) Immediate next deliverable options

Option A (recommended now):
- Build low-fi wireframes first, then implement directly in Next.js

Option B:
- Create Figma high-fi before coding

Option C:
- Build 2 HTML visual variants in-repo (`sketch` workflow) and pick one quickly

---

If you want, I can do the next step now: generate two concrete wireframe variants directly in this repo as HTML mockups (clean dark-modern vs clean light-modern) so you and your friends can pick one and start coding immediately.