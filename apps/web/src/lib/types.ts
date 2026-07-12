export type Role = 'ADMIN' | 'CREATOR' | 'EMPLOYER' | 'CLIENT' | 'STUDENT'

export interface ProfileTheme {
  accent?: string
  style?: string
}

export interface Profile {
  id: string
  name: string | null
  email: string
  role: Role
  bio: string | null
  headline: string | null
  isPublic: boolean
  theme: ProfileTheme
  customHighlights: string[]
}

export interface ParsedProfile {
  title: string
  yearsExperience: string
  skills: string[]
  targetRole: string
  targetLocation: string
  confidence: number
  resumeText?: string
  linkedinUrl?: string
}

export interface UserRecord {
  clerkUserId: string
  email?: string
  username?: string
  linkedinUrl?: string
  createdAt: string
  updatedAt: string
}

export interface IngestProfileResponse {
  userId: string
  user?: UserRecord
  parsedProfile: ParsedProfile
  profileCompleteness: number
  source: 'dummy' | 'linkup'
  harness?: 'hermes-linkup'
}

export interface JobOpening {
  id: string
  title: string
  company: string
  location: string
  mode: 'Remote' | 'Hybrid' | 'Onsite'
  salaryRange: string
  postedAt: string
  applyUrl: string
  description: string
  mustHaveSkills: string[]
}

export interface Recommendation {
  id: string
  userId: string
  jobId: string
  score: number
  reasons: string[]
  keywordGaps: string[]
  job?: JobOpening
}

export interface RecommendationsResponse {
  userId: string
  recommendations: Recommendation[]
  source: 'dummy' | 'in-memory-foundation' | 'linkup'
}

export interface TailoredResume {
  jobId: string
  headline: string
  summary: string
  bullets: string[]
  keywordsToAdd: string[]
}

export interface TailorResumeResponse {
  userId: string
  tailored: TailoredResume
  source: 'dummy' | 'linkup'
}
