# Roles Platform Agent Rules (Build Sprint Mode)

We are in a compressed build sprint.

Goal: ship a usable MVP in hours that represents 2-3 years of roadmap direction.
Priority: speed to demonstrable value over robustness.

## Core Operating Priorities

1. Ship a thin vertical slice first
   - Prefer end-to-end flow over perfect internals.
   - A working demo path beats broad incomplete coverage.

2. Optimize for momentum
   - Choose the simplest implementation that works now.
   - Reuse existing code patterns and libraries already in the repo.
   - Avoid large refactors unless they unblock immediate delivery.

3. Explicitly accept temporary shortcuts
   - Hardcoded values are acceptable when they unblock validation.
   - Incomplete abstractions are acceptable when only 1-2 call sites exist.
   - TODOs are acceptable when paired with clear follow-up notes.

4. Scope discipline
   - If a task expands, cut scope to the minimum shippable behavior.
   - Defer non-critical edge cases, fancy UX, and generalized frameworks.
   - Favor "good enough and testable now" over "future-proof".

## Buildathon Technical Constraint (Mandatory)

1. Hermes must be the harness for any AI agent-related solution in this project.
2. External AI platforms/services are allowed only when invoked through Hermes-managed workflows.
3. Linkup (11 Labs/Linkup usage per team constraint) is allowed specifically for web search APIs, and must be accessed via Hermes-run tasks/tools.
4. Do not put any standalone non-Hermes agent runtime on the critical path for the demo.

## Code Quality Bar for This Phase

Required:
- Code compiles and runs.
- Critical path works for the primary user flow.
- No secrets committed.
- No obvious security footguns in auth, data exposure, or destructive operations.

Not required for this sprint:
- Comprehensive abstraction layers.
- Full edge-case handling.
- Perfect architecture for long-term scale.
- Broad test coverage beyond critical path smoke tests.

## Decision Rules

When multiple options exist, prefer the one that is:
1) fastest to implement,
2) easiest to verify quickly,
3) easiest to replace later.

## Delivery Style

- Keep PRs/changes small and incremental.
- After each change: run the smallest meaningful verification.
- Document assumptions and deferred work in-place (short notes/TODOs).

## Escalate Immediately If

- A requested shortcut introduces serious security or data-loss risk.
- Scope cannot be reduced further without breaking the demo goal.
- Tooling/environment issues block delivery path.
