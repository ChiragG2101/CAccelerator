import type { DummyJobOpening } from '../../data/dummyCareerData.js'
import { InMemoryJobOpeningRepository } from '../../repositories/jobOpeningRepository.js'
import {
  buildDiscoveryQueryPlan,
  type DiscoveryPlanInput,
} from './discoveryPlanner.js'

export class DiscoveryService {
  constructor(private readonly jobsRepository: InMemoryJobOpeningRepository) {}

  buildQueryPlan(input: DiscoveryPlanInput) {
    const queries = buildDiscoveryQueryPlan(input)

    return {
      generatedAt: new Date().toISOString(),
      totalQueries: queries.length,
      channels: [...new Set(queries.map((query) => query.channel))],
      queries,
    }
  }

  async ingestDiscoveredJobs(input: { jobs: DummyJobOpening[]; runId: string }) {
    const upserted = await this.jobsRepository.upsertMany(input.jobs)

    return {
      runId: input.runId,
      received: input.jobs.length,
      upserted: upserted.length,
      source: 'linkup-planned',
      ingestedAt: new Date().toISOString(),
    }
  }
}
