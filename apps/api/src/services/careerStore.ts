import type { CandidateRecord, ProfileInput, ProfileRecord, ParsedCandidate, TailoredOutput } from '../domain.js'
import { Candidate } from '../models/candidate.model.js'
import { CandidateProfile } from '../models/candidateProfile.model.js'
import { TailoredResume, tailoringHash } from '../models/tailoredResume.model.js'

export interface CareerStore {
  resolveCandidate(identity: { clerkUserId: string; email?: string; displayName?: string }): Promise<CandidateRecord>
  getCandidate(id: string): Promise<CandidateRecord | null>
  saveProfile(candidateId: string, input: ProfileInput, parsed: ParsedCandidate, status: 'completed' | 'fallback'): Promise<ProfileRecord>
  getProfile(candidateId: string): Promise<ProfileRecord | null>
  saveTailored(candidateId: string, profileId: string, jobId: string, output: TailoredOutput, status: 'completed' | 'fallback'): Promise<{ id: string; output: TailoredOutput; status: string }>
  getTailored(candidateId: string, id: string): Promise<{ id: string; output: TailoredOutput; status: string } | null>
}

const candidateRecord = (doc: any): CandidateRecord => ({ id: String(doc._id), clerkUserId: doc.clerkUserId, email: doc.email, displayName: doc.displayName, status: doc.status })
const profileRecord = (doc: any): ProfileRecord => ({
  id: String(doc._id), candidateId: String(doc.candidateId), targetRole: doc.targetRole,
  preferredLocations: doc.preferredLocations ?? [], workModes: doc.workModes ?? [], source: doc.source,
  contentHash: doc.contentHash, originalFileName: doc.originalFileName, mimeType: doc.mimeType,
  extractionVersion: doc.extractionVersion, hermesRunId: doc.hermesRunId,
  parsed: doc.parsed, parseStatus: doc.parseStatus, parseVersion: doc.parseVersion,
})

export class MongooseCareerStore implements CareerStore {
  async resolveCandidate(identity: { clerkUserId: string; email?: string; displayName?: string }) {
    const doc = await Candidate.findOneAndUpdate({ clerkUserId: identity.clerkUserId }, { $setOnInsert: identity }, { new: true, upsert: true })
    return candidateRecord(doc)
  }
  async getCandidate(id: string) { const doc = await Candidate.findById(id).lean(); return doc ? candidateRecord(doc) : null }
  async saveProfile(candidateId: string, input: ProfileInput, parsed: ParsedCandidate, status: 'completed' | 'fallback') {
    const doc = await CandidateProfile.findOneAndUpdate({ candidateId }, { ...input, parsed, parseStatus: status, parseVersion: 'v2' }, { new: true, upsert: true })
    await Candidate.updateOne({ _id: candidateId }, { status: 'ready' })
    return profileRecord(doc)
  }
  async getProfile(candidateId: string) { const doc = await CandidateProfile.findOne({ candidateId }).lean(); return doc ? profileRecord(doc) : null }
  async saveTailored(candidateId: string, profileId: string, jobId: string, output: TailoredOutput, status: 'completed' | 'fallback') {
    const doc = await TailoredResume.findOneAndUpdate({ inputHash: tailoringHash(candidateId, profileId, jobId) }, { $setOnInsert: { candidateId, profileId, jobId, inputHash: tailoringHash(candidateId, profileId, jobId), output, status, promptVersion: 'v1' } }, { new: true, upsert: true })
    return { id: String(doc._id), output: doc.output as TailoredOutput, status: doc.status }
  }
  async getTailored(candidateId: string, id: string) { const doc = await TailoredResume.findOne({ _id: id, candidateId }).lean<any>(); return doc ? { id: String(doc._id), output: doc.output as TailoredOutput, status: doc.status } : null }
}

export class MemoryCareerStore implements CareerStore {
  private candidates = new Map<string, CandidateRecord>(); private profiles = new Map<string, ProfileRecord>(); private tailored = new Map<string, { candidateId: string; id: string; output: TailoredOutput; status: string }>()
  async resolveCandidate(identity: { clerkUserId: string; email?: string; displayName?: string }) { let value = [...this.candidates.values()].find((item) => item.clerkUserId === identity.clerkUserId); if (!value) { value = { id: `candidate-${this.candidates.size + 1}`, ...identity, status: 'onboarding' }; this.candidates.set(value.id, value) } return value }
  async getCandidate(id: string) { return this.candidates.get(id) ?? null }
  async saveProfile(candidateId: string, input: ProfileInput, parsed: ParsedCandidate, status: 'completed' | 'fallback') { const value = { id: `profile-${candidateId}`, candidateId, ...input, parsed, parseStatus: status, parseVersion: 'v2' } as ProfileRecord; this.profiles.set(candidateId, value); return value }
  async getProfile(candidateId: string) { return this.profiles.get(candidateId) ?? null }
  async saveTailored(candidateId: string, _profileId: string, jobId: string, output: TailoredOutput, status: 'completed' | 'fallback') { const id = `tailored-${candidateId}-${jobId}`; const value = { candidateId, id, output, status }; this.tailored.set(id, value); return value }
  async getTailored(candidateId: string, id: string) { const value = this.tailored.get(id); return value?.candidateId === candidateId ? value : null }
}
