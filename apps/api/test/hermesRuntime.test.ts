import assert from 'node:assert/strict'
import test from 'node:test'

import { FakeHermesRuntime } from '../src/runtimes/FakeHermesRuntime.js'
import { candidatePersonaSchema, HermesRuntimeError, type CandidatePersona } from '../src/runtimes/HermesRuntime.js'
import { HttpHermesRuntime } from '../src/runtimes/hermes/hermesRuntime.js'

const context = { requestId: 'request-123' }
const input = {
  resumeText: 'Built APIs with TypeScript, Node.js, MongoDB and AWS.',
  targetRole: 'Platform Engineer',
  preferredLocations: ['Remote'],
  workModes: ['remote'] as Array<'remote' | 'hybrid' | 'onsite'>,
  extractionWarnings: ['layout simplified'],
}
const persona: CandidatePersona = {
  headline: 'Platform Engineer',
  summary: 'Engineer building TypeScript APIs.',
  skills: ['TypeScript'],
  industries: [],
  roles: ['Engineer'],
  locations: [],
  education: [],
  experience: [],
  achievements: [],
  preferences: { targetRole: 'Platform Engineer', preferredLocations: ['Remote'], workModes: ['remote'] },
}

test('CandidatePersona schema is strict and requires the complete production shape', () => {
  assert.deepEqual(candidatePersonaSchema.parse(persona), persona)
  assert.throws(() => candidatePersonaSchema.parse({ ...persona, inventedField: true }))
  const { summary: _summary, ...withoutSummary } = persona
  assert.throws(() => candidatePersonaSchema.parse(withoutSummary))
})

test('FakeHermesRuntime is deterministic, isolated, and labeled test/local only', async () => {
  const runtime = new FakeHermesRuntime()
  const first = await runtime.parseCandidate(input, context)
  first.data.skills.push('mutation')
  const second = await runtime.parseCandidate(input, context)

  assert.deepEqual(second.data.skills, ['typescript', 'node.js', 'mongodb', 'aws'])
  assert.deepEqual(second.data.preferences, {
    targetRole: 'Platform Engineer', preferredLocations: ['Remote'], workModes: ['remote'],
  })
  assert.deepEqual(second.data.experience, [])
  assert.deepEqual(await runtime.health(), { status: 'healthy', detail: 'fake runtime (test/local fixture only)' })
})

test('FakeHermesRuntime tailors only from deterministic candidate and job facts', async () => {
  const runtime = new FakeHermesRuntime()
  const result = await runtime.tailorResume({
    candidate: persona,
    job: { title: 'Senior Engineer', company: 'Example Co', description: 'Build APIs', skills: ['TypeScript', 'AWS'] },
  }, context)

  assert.deepEqual(result.data.keywordsToAdd, ['AWS'])
  assert.match(result.data.summary, /TypeScript/)
  assert.deepEqual(result.data.bullets, ['Applied TypeScript in prior work.'])
})

test('HttpHermesRuntime uses persistent API contract, evidence prompt, and Zod validation', async () => {
  let receivedUrl = ''
  let receivedInit: RequestInit | undefined
  const runtime = new HttpHermesRuntime({
    baseUrl: 'http://hermes.test:8642', apiKey: 'test-secret',
    fetch: async (request, init) => {
      receivedUrl = String(request)
      receivedInit = init
      return Response.json({ id: 'chatcmpl-runtime-1', choices: [{ message: { content: `\`\`\`json\n${JSON.stringify(persona)}\n\`\`\`` } }] })
    },
  })

  const result = await runtime.parseCandidate(input, context)
  const body = JSON.parse(String(receivedInit?.body)) as { messages: Array<{ role: string; content: string }> }

  assert.equal(receivedUrl, 'http://hermes.test:8642/v1/chat/completions')
  assert.equal(new Headers(receivedInit?.headers).get('Authorization'), 'Bearer test-secret')
  assert.equal(new Headers(receivedInit?.headers).get('X-Request-Id'), context.requestId)
  assert.match(body.messages[0]!.content, /Do not infer or invent employers, roles, dates, education, achievements, metrics, skills/)
  assert.equal(body.messages[1]!.content, JSON.stringify(input))
  assert.deepEqual(result, { data: persona, hermesSessionId: 'chatcmpl-runtime-1' })
})

test('HttpHermesRuntime maps invalid output, auth, and timeouts to stable errors', async (t) => {
  await t.test('invalid structured output', async () => {
    const runtime = new HttpHermesRuntime({ baseUrl: 'http://hermes.test', apiKey: 'secret', fetch: async () => Response.json({ choices: [{ message: { content: '{}' } }] }) })
    await assert.rejects(() => runtime.parseCandidate(input, context), (error: unknown) => error instanceof HermesRuntimeError && error.code === 'HERMES_BAD_RESPONSE')
  })
  await t.test('authentication failure', async () => {
    const runtime = new HttpHermesRuntime({ baseUrl: 'http://hermes.test', apiKey: 'secret', fetch: async () => new Response(null, { status: 401 }) })
    await assert.rejects(() => runtime.parseCandidate(input, context), (error: unknown) => error instanceof HermesRuntimeError && error.code === 'HERMES_AUTH_FAILED')
  })
  await t.test('timeout', async () => {
    const runtime = new HttpHermesRuntime({
      baseUrl: 'http://hermes.test', apiKey: 'secret', timeoutMs: 5,
      fetch: () => new Promise((_resolve, reject) => setTimeout(() => reject(new DOMException('timed out', 'TimeoutError')), 10)),
    })
    await assert.rejects(() => runtime.parseCandidate(input, context), (error: unknown) => error instanceof HermesRuntimeError && error.code === 'HERMES_TIMEOUT')
  })
})

test('HttpHermesRuntime health uses persistent health endpoint and hides transport errors', async () => {
  const runtime = new HttpHermesRuntime({ baseUrl: 'http://hermes.test', apiKey: 'secret', fetch: async () => { throw new Error('private network detail') } })
  assert.deepEqual(await runtime.health(), { status: 'unavailable', detail: 'HERMES_UNAVAILABLE' })
})
