import { createHash } from 'node:crypto'

import type { DummyJobOpening } from '../../data/dummyCareerData.js'
import { InMemoryJobOpeningRepository } from '../../repositories/jobOpeningRepository.js'
import {
  buildDiscoveryQueryPlan,
  type DiscoveryPlanInput,
  type DiscoveryQueryTask,
} from './discoveryPlanner.js'
import { HttpLinkupClient, type LinkupClient, type LinkupSearchResult } from './linkupClient.js'

const SKILL_KEYWORDS = [
  'typescript',
  'javascript',
  'react',
  'next.js',
  'node.js',
  'python',
  'java',
  'aws',
  'kubernetes',
  'docker',
  'mongodb',
  'postgresql',
  'system design',
]

export class DiscoveryService {
  constructor(
    private readonly jobsRepository: InMemoryJobOpeningRepository,
    private readonly linkupClient: LinkupClient = new HttpLinkupClient()
  ) {}

  buildQueryPlan(input: DiscoveryPlanInput) {
    const queries = buildDiscoveryQueryPlan(input)

    return {
      harness: 'hermes-linkup',
      generatedAt: new Date().toISOString(),
      totalQueries: queries.length,
      channels: [...new Set(queries.map((query) => query.channel))],
      queries,
    }
  }

  async runDiscoveryWithLinkup(
    input: DiscoveryPlanInput & { runId?: string; maxQueries?: number; maxResultsPerQuery?: number }
  ) {
    const runId = input.runId ?? `linkup-run-${Date.now()}`
    const queryPlan = buildDiscoveryQueryPlan(input)
    const maxQueries = clamp(input.maxQueries ?? 8, 1, 20)
    const maxResultsPerQuery = clamp(input.maxResultsPerQuery ?? 5, 1, 20)

    const selectedQueries = queryPlan.slice(0, maxQueries)
    const discoveredJobs: DummyJobOpening[] = []
    const errors: string[] = []

    for (const queryTask of selectedQueries) {
      try {
        const results = await this.linkupClient.searchResults({ query: queryTask.query })

        for (const result of results.slice(0, maxResultsPerQuery)) {
          discoveredJobs.push(linkupResultToJob(result, queryTask))
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        errors.push(`${queryTask.platform}: ${message}`)
      }
    }

    const upserted = await this.jobsRepository.upsertMany(discoveredJobs)

    return {
      harness: 'hermes-linkup',
      provider: 'linkup',
      runId,
      generatedAt: new Date().toISOString(),
      totalQueryTasks: queryPlan.length,
      executedQueryTasks: selectedQueries.length,
      discoveredRecords: discoveredJobs.length,
      upsertedRecords: upserted.length,
      errors,
      jobsPreview: upserted.slice(0, 10),
    }
  }


  async ingestDiscoveredJobs(input: { jobs: DummyJobOpening[]; runId: string }) {
    const upserted = await this.jobsRepository.upsertMany(input.jobs)

    return {
      harness: 'hermes-linkup',
      runId: input.runId,
      received: input.jobs.length,
      upserted: upserted.length,
      source: 'linkup-planned',
      ingestedAt: new Date().toISOString(),
    }
  }
}

function linkupResultToJob(result: LinkupSearchResult, queryTask: DiscoveryQueryTask): DummyJobOpening {
  const id = `job_${createHash('sha1').update(result.url).digest('hex').slice(0, 12)}`
  const parsed = parseTitleAndCompany(result.title)
  const skillText = `${result.title} ${result.snippet ?? ''}`

  return {
    id,
    title: parsed.title,
    company: parsed.company,
    location: inferLocation(result.snippet),
    mode: inferMode(result.snippet),
    salaryRange: 'Not specified',
    postedAt: 'Recently discovered',
    applyUrl: result.url,
    description: result.snippet ?? `Discovered via ${queryTask.platform}`,
    mustHaveSkills: extractSkills(skillText),
  }
}

function parseTitleAndCompany(rawTitle: string): { title: string; company: string } {
  const separators = [' at ', ' @ ', ' - ', ' | ']

  for (const separator of separators) {
    const parts = rawTitle.split(separator)
    if (parts.length >= 2) {
      return {
        title: parts[0].trim(),
        company: parts[1].trim(),
      }
    }
  }

  return {
    title: rawTitle.trim(),
    company: 'Unknown Company',
  }
}

function inferMode(snippet?: string): 'Remote' | 'Hybrid' | 'Onsite' {
  const text = (snippet ?? '').toLowerCase()
  if (text.includes('hybrid')) {
    return 'Hybrid'
  }
  if (text.includes('onsite') || text.includes('on-site')) {
    return 'Onsite'
  }
  return 'Remote'
}

function inferLocation(snippet?: string): string {
  if (!snippet) {
    return 'Remote'
  }

  const locationMatch = snippet.match(/(?:in|based in)\s+([A-Za-z\s,]+)/i)
  return locationMatch?.[1]?.trim() || 'Remote'
}

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase()
  return SKILL_KEYWORDS.filter((keyword) => lower.includes(keyword)).map(toDisplaySkill)
}

function toDisplaySkill(keyword: string): string {
  const exactMap: Record<string, string> = {
    typescript: 'TypeScript',
    javascript: 'JavaScript',
    'next.js': 'Next.js',
    'node.js': 'Node.js',
    aws: 'AWS',
    mongodb: 'MongoDB',
    postgresql: 'PostgreSQL',
    react: 'React',
    python: 'Python',
    java: 'Java',
    kubernetes: 'Kubernetes',
    docker: 'Docker',
    'system design': 'System Design',
  }

  return exactMap[keyword] ?? keyword.charAt(0).toUpperCase() + keyword.slice(1)
}


function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
