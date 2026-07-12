---
name: rapid-mvp-build-mode
description: Use when the team is in a compressed shipping window and needs a functional MVP in hours, prioritizing speed and demonstrable outcomes over long-term robustness.
version: 1.0.0
author: Roles Platform Team
license: MIT
metadata:
  hermes:
    tags: [mvp, speed, delivery, scope, sprint]
    related_skills: [mvp-scope-guardrails]
---

# Rapid MVP Build Mode

## Overview
This skill is for extreme time compression where the goal is to ship a believable end-to-end MVP quickly. It prioritizes working flows, visible outcomes, and reversible decisions over completeness and durability.

## When to Use
- You must ship a demo-ready increment in hours, not weeks.
- Product direction is still being validated.
- Stakeholders need concrete functionality now.

Don't use for:
- Security-sensitive rewrites requiring strong guarantees.
- Public production hardening passes.
- Broad platform migrations.

## Operating Loop

1. Lock the thin slice
   - Define one primary user journey and one success condition.
   - Completion criterion: there is a single sentence describing "what works".

2. Build shortest-path implementation
   - Use existing repo conventions and dependencies.
   - Prefer direct code over generic frameworks.
   - Completion criterion: feature works locally on happy path.

3. Verify only what matters now
   - Run smoke checks for critical path (build/lint/relevant run path).
   - Skip broad non-critical validations in this mode.
   - Completion criterion: no blocker in core flow.

4. Capture debt explicitly
   - Add concise TODO/FIXME where shortcuts were taken.
   - Mark assumptions and known limits.
   - Completion criterion: future-hardening tasks are discoverable in code.

## Allowed Shortcuts
- Hardcoded config defaults for known demo environments.
- Narrow interfaces for current call sites only.
- Minimal error handling where failure impact is low.

## Disallowed Shortcuts
- Anything that risks credential leakage.
- Anything that can corrupt user data silently.
- Anything that makes rollback impossible.

## Common Pitfalls
1. Overbuilding for imagined scale.
   - Fix: cut to the first demonstrable path.
2. Chasing edge-case perfection before a demo path exists.
   - Fix: handle only high-probability failures now.
3. Silent technical debt.
   - Fix: leave explicit, searchable TODO/FIXME notes.

## Verification Checklist
- [ ] Primary user flow works end to end.
- [ ] Code builds and runs.
- [ ] No obvious high-risk security/data-loss shortcut introduced.
- [ ] Debt and assumptions documented where they occur.
