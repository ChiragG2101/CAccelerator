---
name: mvp-scope-guardrails
description: Use when feature scope is expanding during an MVP sprint and decisions are needed to keep delivery inside a tight timebox.
version: 1.0.0
author: Roles Platform Team
license: MIT
metadata:
  hermes:
    tags: [mvp, scope, triage, prioritization]
    related_skills: [rapid-mvp-build-mode]
---

# MVP Scope Guardrails

## Overview
This skill prevents scope creep during fast MVP delivery by forcing triage decisions into must-have, should-have, and later buckets.

## When to Use
- New asks are arriving while implementation is in progress.
- Timebox is fixed but feature list is growing.
- Team is debating robustness vs speed.

## Triage Framework

Classify every requested item as:

1) Must ship now
- Required for the core demo flow to function.

2) Should ship if cheap
- Valuable, but only if implementable quickly without destabilizing core flow.

3) Later
- Nice-to-have polish, generalization, deep edge-case handling, or scale work.

Completion criterion: every item is explicitly in one bucket.

## Trade-off Rules
- If implementation time is uncertain, assume it is expensive and defer.
- If a change adds abstraction without immediate reuse, defer.
- If a feature does not change demo outcome, defer.
- If safety risk is high (security/data integrity), either handle minimally and safely now or cut from scope.

## Fast Decision Prompts
Use these prompts before building anything non-trivial:
- Does this directly improve the primary demo flow?
- Can we finish and verify it within the current sprint block?
- Can we replace this later without major rewrites?

If any answer is "no", move it to Later.

## Common Pitfalls
1. Bundling optional polish into critical tasks.
   - Fix: separate tickets by bucket.
2. Hidden complexity from "quick" abstractions.
   - Fix: implement concrete path first.
3. Refusing to cut scope.
   - Fix: protect demo flow over completeness.

## Verification Checklist
- [ ] Core flow requirements are isolated from optional work.
- [ ] Deferred items are documented as explicit follow-ups.
- [ ] Current sprint work fits realistic implementation time.
