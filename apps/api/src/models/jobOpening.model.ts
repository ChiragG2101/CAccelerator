import mongoose from 'mongoose'
const { Schema, model, models } = mongoose

const jobSchema = new Schema({
  source: { type: String, enum: ['seed', 'linkup', 'other'], required: true }, externalId: { type: String, required: true },
  title: { type: String, required: true }, company: { type: String, required: true }, location: { type: String, required: true },
  workMode: { type: String, enum: ['remote', 'hybrid', 'onsite', 'unknown'], default: 'unknown' },
  description: { type: String, required: true }, skills: [String], minYearsExperience: Number,
  applyUrl: { type: String, required: true }, isActive: { type: Boolean, default: true },
}, { timestamps: true })
jobSchema.index({ source: 1, externalId: 1 }, { unique: true })
jobSchema.index({ isActive: 1, createdAt: -1 })
export const JobOpening = models.JobOpening ?? model('JobOpening', jobSchema)
