import assert from 'node:assert/strict'
import test from 'node:test'
import type { RequestHandler } from 'express'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { MemoryCareerStore } from '../src/services/careerStore.js'
import { rankJob } from '../src/services/recommendations/ranking.service.js'
import { seedJobs } from '../src/data/seedJobs.js'
import type { ProfileRecord } from '../src/domain.js'

const auth: RequestHandler = (req, _res, next) => { req.authIdentity = { clerkUserId: 'clerk-google-user', email: 'user@example.com' }; next() }
const unauthenticated: RequestHandler = (_req, _res, next) => next(Object.assign(new Error('Authentication required'), { status: 401, code: 'UNAUTHENTICATED' }))
const setup = () => createApp({ store: new MemoryCareerStore(), authMiddleware: auth })

async function onboard(app: ReturnType<typeof createApp>) {
  const candidate = await request(app).post('/v1/candidates').send({ candidateId: 'ignored' })
  const id = candidate.body.data.id as string
  const profile = await request(app).put(`/v1/candidates/${id}/profile`).send({ resumeText: 'Senior Full Stack Engineer with 5 years building TypeScript React Node.js APIs. Based in Bengaluru.', targetRole: 'Full Stack Engineer', preferredLocations: ['Bengaluru'], workModes: ['hybrid'] })
  return { id, profile }
}

test('health is public and protected routes fail closed', async () => {
  const app = createApp({ store: new MemoryCareerStore(), authMiddleware: unauthenticated })
  assert.equal((await request(app).get('/health/live')).status, 200)
  const response = await request(app).post('/v1/candidates')
  assert.equal(response.status, 401); assert.equal(response.body.error.code, 'UNAUTHENTICATED')
})

test('public resume parsing endpoint validates before provider calls', async () => {
  const app = createApp({ store: new MemoryCareerStore(), authMiddleware: unauthenticated })
  const resume = await request(app).post('/v1/parse/resume')
    .field('targetRole', 'Engineer').field('preferredLocations', 'Remote').field('workModes', 'remote')
    .attach('resume', Buffer.from('not a resume'), { filename: 'resume.txt', contentType: 'text/plain' })
  assert.equal(resume.status, 415); assert.equal(resume.body.error.code, 'UNSUPPORTED_RESUME_TYPE')
})

test('lazy candidate mapping is idempotent and ignores body identity', async () => {
  const app = setup(); const first = await request(app).post('/v1/candidates').send({ clerkUserId: 'attacker' }); const second = await request(app).post('/v1/candidates')
  assert.equal(first.status, 200); assert.equal(first.body.data.id, second.body.data.id); assert.equal(first.body.data.clerkUserId, 'clerk-google-user')
})

test('resume parsing, persona ranking, tailoring and ownership form a working vertical slice', async () => {
  const app = setup(); const { id, profile } = await onboard(app)
  assert.equal(profile.status, 200); assert.equal(profile.body.data.parseStatus, 'fallback'); assert.ok(profile.body.data.parsed.skills.includes('typescript'))
  const recommendations = await request(app).post(`/v1/candidates/${id}/recommendations?limit=10`)
  assert.equal(recommendations.status, 200); assert.equal(recommendations.body.data.length, 10); assert.ok(recommendations.body.data[0].score >= recommendations.body.data[1].score)
  const tailored = await request(app).post(`/v1/candidates/${id}/tailored-resumes`).send({ jobId: recommendations.body.data[0].job.id })
  assert.equal(tailored.status, 201); assert.equal(tailored.body.data.status, 'fallback'); assert.ok(tailored.body.data.output.headline)
  assert.equal((await request(app).get(`/v1/candidates/other/profile`)).status, 403)
  assert.equal((await request(app).get(`/v1/candidates/${id}/tailored-resumes/${tailored.body.data.id}`)).status, 200)
})

test('validation uses standard error envelope', async () => {
  const app = setup(); const candidate = await request(app).post('/v1/candidates'); const response = await request(app).put(`/v1/candidates/${candidate.body.data.id}/profile`).send({ resumeText: 'short' })
  assert.equal(response.status, 400); assert.equal(response.body.error.code, 'VALIDATION_ERROR'); assert.ok(response.body.requestId)
})

test('resume upload rejects unsupported content types before parsing', async () => {
  const app = setup(); const candidate = await request(app).post('/v1/candidates')
  const response = await request(app).post(`/v1/candidates/${candidate.body.data.id}/resume`)
    .field('targetRole', 'Software Engineer').field('preferredLocations', 'Remote').field('workModes', 'remote')
    .attach('resume', Buffer.from('plain text is not a supported upload'), { filename: 'resume.txt', contentType: 'text/plain' })
  assert.equal(response.status, 415); assert.equal(response.body.error.code, 'UNSUPPORTED_RESUME_TYPE')
})

test('ranking v1 exact fixture remains deterministic', () => {
  const profile: ProfileRecord = { id: 'p', candidateId: 'c', targetRole: 'Full Stack Engineer', preferredLocations: ['Remote'], workModes: ['remote'], source: 'pasted-text', contentHash: 'hash', extractionVersion: 'text-v1', parsed: { headline: 'Full Stack Engineer', summary: 'Engineer', yearsExperience: 5, skills: ['typescript', 'react', 'node.js', 'mongodb'], industries: [], roles: [], locations: [], education: [], experience: [], achievements: [], preferences: { targetRole: 'Full Stack Engineer', preferredLocations: ['Remote'], workModes: ['remote'] } }, parseStatus: 'fallback', parseVersion: 'v2' }
  const result = rankJob(profile, seedJobs[0]!)
  assert.deepEqual(result.components, { skill: 40, title: 25, location: 0, experience: 15 }); assert.equal(result.score, 80); assert.equal(result.rankingVersion, 'v1')
})
