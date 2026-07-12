import assert from 'node:assert/strict'
import test from 'node:test'

import { InMemoryJobOpeningRepository } from '../src/repositories/jobOpeningRepository.js'
import { DiscoveryService } from '../src/services/discovery/discoveryService.js'
import type { LinkupClient } from '../src/services/discovery/linkupClient.js'

class MockLinkupClient implements LinkupClient {
  async searchResults(input: { query: string }) {
    return [
      {
        title: `Senior Software Engineer at Acme (${input.query})`,
        url: `https://careers.acme.com/jobs/${encodeURIComponent(input.query)}`,
        snippet: 'Remote role in Bengaluru. Tech stack includes TypeScript, Node.js, React.',
      },
    ]
  }

  async fetchWebpage(input: { url: string }) {
    return {
      url: input.url,
      title: 'Jane Doe - Senior Software Engineer',
      content:
        'Jane Doe\nSenior Software Engineer\nSkills: TypeScript, Node.js, React, AWS. Built distributed systems and APIs.',
    }
  }
}

test('runDiscoveryWithLinkup discovers and upserts jobs', async () => {
  const repository = new InMemoryJobOpeningRepository()
  const service = new DiscoveryService(repository, new MockLinkupClient())

  const result = await service.runDiscoveryWithLinkup({
    role: 'Software Engineer',
    location: 'Remote',
    targetCompanies: ['Acme'],
    maxQueries: 2,
    maxResultsPerQuery: 1,
  })

  assert.equal(result.harness, 'hermes-linkup')
  assert.equal(result.executedQueryTasks, 2)
  assert.ok(result.discoveredRecords >= 2)

  const jobs = await repository.listActive()
  assert.ok(jobs.length >= 1)
  assert.equal(jobs[0].company.includes('Acme'), true)
})

test('scrapeProfileWithLinkup extracts profile signals', async () => {
  const repository = new InMemoryJobOpeningRepository()
  const service = new DiscoveryService(repository, new MockLinkupClient())

  const profile = await service.scrapeProfileWithLinkup({
    linkedinUrl: 'https://www.linkedin.com/in/jane-doe',
    targetRole: 'Software Engineer',
    location: 'Remote',
  })

  assert.equal(profile.targetRole, 'Software Engineer')
  assert.equal(profile.targetLocation, 'Remote')
  assert.ok((profile.skills ?? []).includes('TypeScript'))
  assert.ok((profile.skills ?? []).includes('Node.js'))
  assert.equal(profile.profileSourceUrl, 'https://www.linkedin.com/in/jane-doe')
})
