import assert from 'node:assert/strict'
import test from 'node:test'
import { enrichLinkedInProfile } from '../src/services/profile/linkupLinkedIn.js'

test('Linkup LinkedIn enrichment sends a grounded server-side search request', async () => {
  let request: { input: string; init?: RequestInit } | undefined
  const result = await enrichLinkedInProfile('https://www.linkedin.com/in/example', {
    apiKey: 'test-key',
    fetchImpl: async (input, init) => {
      request = { input: String(input), init }
      return new Response(JSON.stringify({ answer: 'Public profile facts', sources: [{ url: 'https://www.linkedin.com/in/example' }] }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    },
  })
  assert.equal(request?.input, 'https://api.linkup.so/v1/search')
  assert.equal(request?.init?.headers && (request.init.headers as Record<string, string>).Authorization, 'Bearer test-key')
  const body = JSON.parse(String(request?.init?.body)) as Record<string, unknown>
  assert.equal(body.depth, 'standard')
  assert.equal(body.outputType, 'sourcedAnswer')
  assert.deepEqual(body.includeDomains, ['linkedin.com'])
  assert.equal(result.profileText, 'Public profile facts')
})

test('Linkup LinkedIn enrichment fails closed without an API key', async () => {
  await assert.rejects(() => enrichLinkedInProfile('https://www.linkedin.com/in/example', { apiKey: '' }), (error: unknown) => {
    assert.equal((error as { code?: string }).code, 'LINKUP_NOT_CONFIGURED')
    return true
  })
})
