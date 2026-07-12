# Hermes integration spike

Verified on 2026-07-12 against the official Hermes Agent API Server documentation and the locally installed Hermes Agent v0.18.2 source/docs.

## Selected production boundary

`HttpHermesRuntime` uses the persistent Hermes API Server, not a per-request `hermes chat -q` subprocess. It is deliberately confined to `apps/api/src/runtimes/hermes/` so product services depend only on `HermesRuntime`.

Configuration passed by the future composition root:

- `baseUrl` (`http://127.0.0.1:8643` for the local `resume-parser` profile)
- `apiKey` (the Hermes `API_SERVER_KEY`; never browser-exposed)
- optional advertised `model`, timeout, paths, and injectable `fetch`

The adapter sends non-streaming OpenAI Chat Completions requests and validates assistant JSON with a strict Zod `CandidatePersona` schema. Parsing input requires normalized `resumeText`, target preferences, and optional extraction warnings; file paths and alternate profile-summary sources are outside this boundary. It logs neither prompts nor raw candidate/job data. Errors are reduced to stable codes: `HERMES_TIMEOUT`, `HERMES_UNAVAILABLE`, `HERMES_AUTH_FAILED`, and `HERMES_BAD_RESPONSE`.

## Verified Hermes facts

Source of truth: <https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server>

- Enable the persistent API Server with `API_SERVER_ENABLED=true`; default bind is `127.0.0.1:8642`.
- `API_SERVER_KEY` is required and requests authenticate with `Authorization: Bearer ...`.
- `POST /v1/chat/completions` accepts OpenAI Chat Completions format. Non-streaming assistant text is at `choices[0].message.content`.
- Chat Completions are stateless: the client supplies messages on each request.
- `GET /health` and `GET /v1/health` return `{"status":"ok"}` when healthy.
- `GET /v1/capabilities` advertises supported API features, including runs and cancellation where available.
- The request `model` is cosmetic; the actual provider/model is configured server-side.
- A request system message is layered over Hermes' core prompt; it does not remove configured tools.
- A Hermes profile is process/config isolation. Separate profile API servers use distinct ports and advertise the profile name as model ID.
- The API Server can expose powerful tools, including terminal access. Product deployments therefore require a dedicated least-privilege Hermes profile and network isolation.

Local CLI verification also showed `hermes gateway run` as the foreground gateway command. `hermes serve` is a separate JSON-RPC/WebSocket backend for desktop/remote clients and is not the adapter contract selected here.

## Deployment sketch

1. Create a dedicated Career Accelerator Hermes profile with only the minimum tools needed (ideally no terminal, file writes, browser, or messaging).
2. Put `API_SERVER_ENABLED`, `API_SERVER_PORT`, and a strong `API_SERVER_KEY` in that profile's `.env`.
3. Start the persistent gateway as a managed process/container.
4. Keep Hermes on a private/loopback network reachable only by the API service.
5. Inject adapter configuration from API secrets/configuration; do not expose it to the web app.
6. Treat Hermes health as degradable because deterministic product fallbacks exist.

## Resume ingestion boundary

The first product slice extracts PDF/DOCX content in Node, with pasted resume text as a recovery path. Only normalized resume text is sent to Hermes; no local file path is accepted. The text and extraction warnings are treated as untrusted data and converted into a strict, evidence-backed `CandidatePersona`. The parser prompt explicitly forbids inventing employers, roles, dates, education, achievements, metrics, skills, locations, experience duration, or seniority. Missing evidence produces empty arrays or omitted optional fields, never guesses.

LinkedIn scraping, LinkedIn URLs/text, and manual-summary ingestion are explicitly out of scope. Deterministic ranking consumes the validated persona to discover jobs from the current seed catalog.

## Intentionally unresolved before production rollout

- **Profile packaging:** a local `resume-parser` profile is provisioned with memory and all API-server tools disabled. Export/install packaging for other environments remains to be added. The API Server's `model` field does not dynamically select profiles.
- **Guaranteed structured generation:** the documented endpoint returns text and does not document JSON Schema/structured-output enforcement. The adapter requests JSON and rejects malformed/schema-invalid output; product services must invoke deterministic fallback on `HERMES_BAD_RESPONSE`.
- **Cancellation:** client timeout aborts the HTTP request. End-to-end cancellation semantics should be proven with a running deployment. The documented Runs API exposes `POST /v1/runs/{run_id}/stop` and capabilities discovery, but this narrow synchronous adapter does not create runs.
- **Session retention/PII:** Chat Completions are stateless at the HTTP contract, but deployment-level transcript/session persistence and retention must be verified before real resumes are sent. Do not enable long-term memory for this profile.
- **Production authentication/topology:** local loopback authentication is verified; production secret injection, private networking, and container health checks remain.
- **Timeout budget and payload limits:** set from measured model latency and API ingress limits; the adapter currently allows 120 seconds.

## Smoke test after provisioning

```bash
curl -fsS "$HERMES_BASE_URL/v1/health" \
  -H "Authorization: Bearer $HERMES_API_KEY"

curl -fsS "$HERMES_BASE_URL/v1/capabilities" \
  -H "Authorization: Bearer $HERMES_API_KEY"
```

Do not use `hermes chat -q` in the API request path. It is suitable only for manual local diagnosis, not this runtime adapter.
