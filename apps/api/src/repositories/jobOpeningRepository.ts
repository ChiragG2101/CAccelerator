import type { DummyJobOpening } from '../data/dummyCareerData.js'
import { buildJobFingerprint } from '../services/jobs/fingerprint.js'

export interface StoredJobOpening extends DummyJobOpening {
  fingerprint: string
  sourceDomains: string[]
  sourceUrls: string[]
  isActive: boolean
  lastSeenAt: string
}

export class InMemoryJobOpeningRepository {
  private readonly jobsByFingerprint = new Map<string, StoredJobOpening>()
  private readonly fingerprintById = new Map<string, string>()

  seed(jobs: DummyJobOpening[]) {
    void this.upsertMany(jobs)
  }

  async upsertMany(jobs: DummyJobOpening[]): Promise<StoredJobOpening[]> {
    const nowIso = new Date().toISOString()
    const upserted: StoredJobOpening[] = []

    for (const job of jobs) {
      const sourceDomain = safeDomain(job.applyUrl)
      const fingerprint = buildJobFingerprint({
        title: job.title,
        company: job.company,
        location: job.location,
        applyUrl: job.applyUrl,
      })

      const existing = this.jobsByFingerprint.get(fingerprint)
      const merged: StoredJobOpening = {
        ...existing,
        ...job,
        fingerprint,
        sourceDomains: uniqueStringArray([...(existing?.sourceDomains ?? []), sourceDomain]),
        sourceUrls: uniqueStringArray([...(existing?.sourceUrls ?? []), job.applyUrl]),
        isActive: true,
        lastSeenAt: nowIso,
      }

      this.jobsByFingerprint.set(fingerprint, merged)
      this.fingerprintById.set(merged.id, fingerprint)
      upserted.push(merged)
    }

    return upserted
  }

  async listActive(): Promise<StoredJobOpening[]> {
    return [...this.jobsByFingerprint.values()].filter((job) => job.isActive)
  }

  async getById(jobId: string): Promise<StoredJobOpening | null> {
    const fingerprint = this.fingerprintById.get(jobId)
    if (!fingerprint) {
      return null
    }

    return this.jobsByFingerprint.get(fingerprint) ?? null
  }
}

function uniqueStringArray(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function safeDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return 'unknown'
  }
}
