import assert from 'node:assert/strict'
import test from 'node:test'

import request from 'supertest'

import { createApp } from '../src/app.js'

test('GET /health reports the API is healthy', async () => {
  const response = await request(createApp()).get('/health')

  assert.equal(response.status, 200)
  assert.deepEqual(response.body, { ok: true, service: 'api' })
})

test('unknown routes return 404', async () => {
  const response = await request(createApp()).get('/unknown')

  assert.equal(response.status, 404)
  assert.deepEqual(response.body, { error: 'Not found' })
})

test('POST /discovery/plan builds a multi-channel query plan', async () => {
  const response = await request(createApp()).post('/discovery/plan').send({
    role: 'Software Engineer',
    location: 'Bengaluru',
    seniority: 'Senior',
    skills: ['TypeScript', 'Node.js'],
    targetCompanies: ['Razorpay'],
  })

  assert.equal(response.status, 200)
  assert.equal(response.body.ok, true)
  assert.equal(typeof response.body.totalQueries, 'number')
  assert.ok(response.body.totalQueries > 0)
  assert.ok(Array.isArray(response.body.channels))
  assert.ok(response.body.channels.includes('target-company'))
  assert.ok(response.body.channels.includes('ats'))
  assert.ok(Array.isArray(response.body.queries))
  assert.ok(response.body.queries.some((task: { channel: string }) => task.channel === 'search-engine'))
})

test('POST /discovery/plan validates required role field', async () => {
  const response = await request(createApp()).post('/discovery/plan').send({
    location: 'Remote',
  })

  assert.equal(response.status, 400)
  assert.equal(typeof response.body.error, 'object')
})

test('POST /discovery/run surfaces Hermes-Linkup execution status', async () => {
  const response = await request(createApp()).post('/discovery/run').send({
    role: 'Software Engineer',
    location: 'Remote',
  })

  assert.ok([202, 502].includes(response.status))
  assert.equal(response.body.harness, 'hermes-linkup')
})

test('POST /ingest/profile/linkup validates URL input', async () => {
  const response = await request(createApp()).post('/ingest/profile/linkup').send({
    userId: 'demo-user-1',
    linkedinUrl: 'not-a-url',
  })

  assert.equal(response.status, 400)
  assert.equal(typeof response.body.error, 'object')
})
