# Additional AI Agent Plans (Buildathon Constraint) Implementation Plan

> For Hermes: planning artifact to coordinate multiple coding agents while preserving buildathon constraints.

Goal: Define additional, parallel AI-agent workflows we can run during coding while enforcing the buildathon requirement that Hermes is the harness for all agentic work.

Architecture: Keep one orchestrator Hermes session (this repo) and spawn focused Hermes-driven agent streams for research, coding support, and validation. Any external AI capability is consumed through Hermes-run integrations only.

Tech stack: Hermes Agent CLI/tooling, repo-local AGENTS.md rules, optional Linkup web-search API integration via Hermes-managed execution.

---

## 1) Non-negotiable Technical Constraint (add to rules + all plans)

1. Hermes must be the harness for any AI-agent-related solution in this project.
2. External AI platforms/services are allowed only when invoked from Hermes-managed workflows.
3. Linkup (11 Labs/Linkup usage as specified by the team) is allowed specifically for web-search API capability, but it must be routed through Hermes-run tasks/scripts/tools.
4. No standalone non-Hermes agent runtime should be part of the demo critical path.

---

## 2) Additional Agent Plans to run while coding

### Plan A: Implementation Wingman Agent (code-path acceleration)

Objective: Offload isolated coding subtasks while the primary session keeps architecture continuity.

Execution model:
- Use Hermes `delegate_task` for bounded subtasks (e.g., “add endpoint validation”, “write component skeleton”, “add smoke test”).
- Keep one task per subagent focused and file-scoped.
- Require each subagent return touched file paths + verification command + result summary.

Definition of done:
- Subtask output is merged manually into primary flow after quick review.
- Each accepted change is validated with smallest relevant command.

---

### Plan B: Research Scout Agent (web/API reconnaissance)

Objective: Continuously gather external signals (docs, APIs, competitor behavior, references) without interrupting coding flow.

Execution model:
- Run Hermes-managed research tasks (interactive or scheduled) that use Linkup web-search APIs where needed.
- Normalize outputs into concise research notes in repo (or .hermes/plans/notes).
- Include sources, timestamp, and confidence markers.

Constraint enforcement:
- Research calls must be initiated from Hermes tooling/workflows.
- No direct external “agent platform” runs outside Hermes harness.

Definition of done:
- Actionable findings tied to concrete coding decisions (API choice, UX copy, architecture tradeoff).

---

### Plan C: QA/Regression Sentinel Agent (fast confidence)

Objective: Catch regressions quickly during rapid sprint iteration.

Execution model:
- Hermes-run checks after each meaningful change:
  - lint/build/smoke route checks
  - targeted test commands for changed files
- Use background Hermes processes for longer verification jobs when needed.

Definition of done:
- Each coding milestone has at least one recorded verification result.
- Failures are turned into immediate fix tasks or explicit TODO deferrals.

---

## 3) Shared operating rules for all additional agents

1. Keep tasks thin and reversible (2–15 minute units).
2. Prefer deterministic outputs over open-ended generation when under time pressure.
3. Every agent output must include:
   - What changed/found
   - Where (file/path/source)
   - How verified
   - Next immediate action
4. If an agent step would violate the Hermes-harness constraint, stop and reroute via Hermes-compatible flow.

---

## 4) Practical kickoff checklist

1. Confirm Hermes tool access and profile settings for this repo.
2. Start with Plan A + Plan C for core implementation loop.
3. Spin up Plan B only when research is blocking implementation decisions.
4. Add short per-agent prompt templates to keep outputs consistent.
5. Review outputs every 30–60 minutes and prune low-value threads.

---

## 5) Validation and governance

Validation commands (repo root):
- `pnpm run lint`
- `pnpm run build`

Governance checks:
- Verify agentic activity is Hermes-mediated.
- Verify Linkup usage is limited to approved web-search API workflows.
- Document any exception explicitly in plan notes before execution.

---

## 6) Risks and mitigations

1. Risk: “Agent sprawl” causes noisy outputs.
   - Mitigation: Strict task scope + output template + periodic pruning.

2. Risk: Constraint drift (someone uses external agent path directly).
   - Mitigation: Rule codified in AGENTS.md and plan headers; reject non-compliant tasks.

3. Risk: Research latency blocks coding.
   - Mitigation: Default to coding with assumptions; backfill with Research Scout results.

---

## 7) Immediate follow-up file changes

1. Update `AGENTS.md` with a new “Buildathon Technical Constraint” section.
2. Reference this plan in standup/check-in notes for team alignment.
3. Start first two additional agent tracks:
   - Implementation Wingman
   - QA/Regression Sentinel
