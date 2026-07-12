import type { DummyRecommendation } from '../data/dummyCareerData.js'

export interface RecommendationSnapshot extends DummyRecommendation {
  scoringVersion: string
  generatedAt: string
}

export class InMemoryRecommendationRepository {
  private readonly snapshotsByUser = new Map<string, RecommendationSnapshot[]>()

  async saveBatch(userId: string, recommendations: DummyRecommendation[], scoringVersion = 'v0') {
    const generatedAt = new Date().toISOString()
    const rows: RecommendationSnapshot[] = recommendations.map((item) => ({
      ...item,
      scoringVersion,
      generatedAt,
    }))

    this.snapshotsByUser.set(userId, rows)
    return rows
  }

  async getLatestByUser(userId: string): Promise<RecommendationSnapshot[]> {
    return this.snapshotsByUser.get(userId) ?? []
  }
}
