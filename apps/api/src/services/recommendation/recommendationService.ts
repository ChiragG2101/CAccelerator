import {
  buildRecommendations,
  defaultParsedProfile,
  type DummyParsedProfile,
} from '../../data/dummyCareerData.js'
import { InMemoryJobOpeningRepository } from '../../repositories/jobOpeningRepository.js'
import { InMemoryRecommendationRepository } from '../../repositories/recommendationRepository.js'

export class RecommendationService {
  constructor(
    private readonly jobsRepository: InMemoryJobOpeningRepository,
    private readonly recommendationRepository: InMemoryRecommendationRepository
  ) {}

  async getRecommendationsForUser(userId: string, profile?: Partial<DummyParsedProfile>) {
    const activeJobs = await this.jobsRepository.listActive()
    const jobById = new Map(activeJobs.map((job) => [job.id, job]))

    const baseProfile: DummyParsedProfile = {
      ...defaultParsedProfile,
      ...omitUndefined(profile),
    }

    const seeded = buildRecommendations(userId)
      .filter((row) => jobById.has(row.jobId))
      .map((row) => ({
        ...row,
        reasons: appendProfileReasons(row.reasons, baseProfile),
      }))

    const deduped = uniqueBy(seeded, (item) => item.jobId)
    await this.recommendationRepository.saveBatch(userId, deduped, 'v0-foundation')

    return deduped.map((row) => ({
      ...row,
      job: jobById.get(row.jobId),
    }))
  }
}

function uniqueBy<T>(rows: T[], keyFn: (row: T) => string): T[] {
  const seen = new Set<string>()
  const deduped: T[] = []

  for (const row of rows) {
    const key = keyFn(row)
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    deduped.push(row)
  }

  return deduped
}

function appendProfileReasons(reasons: string[], profile: DummyParsedProfile): string[] {
  const extras = [`Target role: ${profile.targetRole}`, `Preferred location: ${profile.targetLocation}`]
  return [...new Set([...reasons, ...extras])]
}

function omitUndefined<T extends object>(value?: Partial<T>): Partial<T> {
  if (!value) {
    return {}
  }

  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as Partial<T>
}
