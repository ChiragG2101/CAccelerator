import type { CandidatePersona, HermesRuntime } from './runtimes/HermesRuntime.js'

export type WorkMode = 'remote' | 'hybrid' | 'onsite'
export type ParsedCandidate = CandidatePersona

export interface ProfileInput {
  targetRole: string
  preferredLocations: string[]
  workModes: WorkMode[]
  source: 'upload' | 'pasted-text'
  contentHash: string
  originalFileName?: string
  mimeType?: string
  extractionVersion: string
  hermesRunId?: string
}

export interface CandidateRecord {
  id: string
  clerkUserId: string
  email?: string
  displayName?: string
  status: 'onboarding' | 'ready' | 'disabled'
}

export interface ProfileRecord extends ProfileInput {
  id: string
  candidateId: string
  parsed: ParsedCandidate
  parseStatus: 'completed' | 'fallback'
  parseVersion: string
}

export interface JobRecord {
  id: string
  source: 'seed' | 'linkup' | 'other'
  externalId: string
  title: string
  company: string
  location: string
  workMode: WorkMode | 'unknown'
  description: string
  skills: string[]
  minYearsExperience?: number
  applyUrl: string
  isActive: boolean
}

export interface RankingResult {
  score: number
  components: { skill: number; title: number; location: number; experience: number }
  matchedSkills: string[]
  missingSkills: string[]
  reasons: string[]
  rankingVersion: 'v1'
}

export interface TailoredOutput {
  headline: string
  summary: string
  bullets: string[]
  keywordsToAdd: string[]
  cautions: string[]
}

export type CareerRuntime = HermesRuntime
