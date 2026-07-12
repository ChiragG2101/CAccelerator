import mongoose, { Schema } from 'mongoose'

export interface JobOpeningCanonicalDocument {
  fingerprint: string
  title: string
  company: string
  location: string
  mode: 'Remote' | 'Hybrid' | 'Onsite'
  salaryRange: string
  postedAt: string
  applyUrl: string
  description: string
  mustHaveSkills: string[]
  sourceDomains: string[]
  sourceUrls: string[]
  isActive: boolean
  lastSeenAt: Date
  freshnessScore: number
  sourceQualityScore: number
  parserVersion: string
  canonicalVersion: string
  createdAt: Date
  updatedAt: Date
}

const jobOpeningCanonicalSchema = new Schema<JobOpeningCanonicalDocument>(
  {
    fingerprint: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    location: { type: String, required: true, index: true },
    mode: { type: String, enum: ['Remote', 'Hybrid', 'Onsite'], required: true, index: true },
    salaryRange: { type: String, required: true },
    postedAt: { type: String, required: true, index: true },
    applyUrl: { type: String, required: true },
    description: { type: String, required: true },
    mustHaveSkills: { type: [String], default: [] },
    sourceDomains: { type: [String], default: [] },
    sourceUrls: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    lastSeenAt: { type: Date, required: true },
    freshnessScore: { type: Number, default: 0.5 },
    sourceQualityScore: { type: Number, default: 0.5 },
    parserVersion: { type: String, default: 'v0' },
    canonicalVersion: { type: String, default: 'v0' },
  },
  {
    timestamps: true,
  }
)

jobOpeningCanonicalSchema.index({ title: 1, location: 1, mode: 1 })

export const JobOpeningCanonicalModel =
  mongoose.models.JobOpeningCanonical ||
  mongoose.model<JobOpeningCanonicalDocument>('JobOpeningCanonical', jobOpeningCanonicalSchema)
