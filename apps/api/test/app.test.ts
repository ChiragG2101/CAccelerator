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
