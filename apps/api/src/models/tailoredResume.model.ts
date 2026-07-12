import { createHash } from 'node:crypto'
import mongoose from 'mongoose'
const { Schema, model, models } = mongoose

const tailoredSchema = new Schema({
  candidateId: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'Candidate' },
  profileId: { type: Schema.Types.ObjectId, required: true, ref: 'CandidateProfile' },
  jobId: { type: String, required: true }, inputHash: { type: String, required: true, unique: true },
  status: { type: String, enum: ['completed', 'fallback'], required: true }, output: { type: Schema.Types.Mixed, required: true },
  promptVersion: { type: String, default: 'v1' },
}, { timestamps: true })
export const TailoredResume = models.TailoredResume ?? model('TailoredResume', tailoredSchema)
export const tailoringHash = (candidateId: string, profileId: string, jobId: string) => createHash('sha256').update(`${candidateId}:${profileId}:${jobId}:v1`).digest('hex')
