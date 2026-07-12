import mongoose from 'mongoose'
const { Schema, model, models } = mongoose

const candidateSchema = new Schema({
  clerkUserId: { type: String, required: true, immutable: true, unique: true, index: true },
  email: { type: String, lowercase: true, trim: true },
  displayName: String,
  status: { type: String, enum: ['onboarding', 'ready', 'disabled'], default: 'onboarding' },
}, { timestamps: true })
candidateSchema.index({ email: 1 }, { unique: true, sparse: true })
export const Candidate = models.Candidate ?? model('Candidate', candidateSchema)
