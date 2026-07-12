import mongoose from 'mongoose'
const { Schema, model, models } = mongoose

const experienceSchema = new Schema({ company: String, title: { type: String, required: true }, startDate: String, endDate: String, bullets: [String] }, { _id: false })
const profileSchema = new Schema({
  candidateId: { type: Schema.Types.ObjectId, required: true, unique: true, index: true, ref: 'Candidate' },
  targetRole: { type: String, required: true },
  preferredLocations: [String],
  workModes: [{ type: String, enum: ['remote', 'hybrid', 'onsite'] }],
  source: { type: String, enum: ['upload', 'pasted-text'], required: true },
  contentHash: { type: String, required: true },
  originalFileName: String,
  mimeType: String,
  extractionVersion: { type: String, required: true },
  hermesRunId: String,
  parsed: {
    headline: String, summary: String, yearsExperience: Number, seniority: String,
    skills: [String], industries: [String], currentRole: String, roles: [String], locations: [String],
    education: [String], experience: [experienceSchema], achievements: [String],
    preferences: { targetRole: String, preferredLocations: [String], workModes: [String] },
  },
  parseStatus: { type: String, enum: ['completed', 'fallback'], required: true },
  parseVersion: { type: String, default: 'v2' },
}, { timestamps: true })
export const CandidateProfile = models.CandidateProfile ?? model('CandidateProfile', profileSchema)
