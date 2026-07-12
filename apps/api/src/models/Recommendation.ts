import mongoose, { Schema } from 'mongoose'

export interface RecommendationDocument {
  userId: string
  jobId: string
  finalScore: number
  semanticScore: number
  skillsOverlapScore: number
  constraintsFitScore: number
  freshnessScore: number
  sourceQualityScore: number
  reasons: string[]
  keywordGaps: string[]
  scoringVersion: string
  generatedAt: Date
  createdAt: Date
  updatedAt: Date
}

const recommendationSchema = new Schema<RecommendationDocument>(
  {
    userId: { type: String, required: true, index: true },
    jobId: { type: String, required: true, index: true },
    finalScore: { type: Number, required: true, index: true },
    semanticScore: { type: Number, required: true },
    skillsOverlapScore: { type: Number, required: true },
    constraintsFitScore: { type: Number, required: true },
    freshnessScore: { type: Number, required: true },
    sourceQualityScore: { type: Number, required: true },
    reasons: { type: [String], default: [] },
    keywordGaps: { type: [String], default: [] },
    scoringVersion: { type: String, required: true, default: 'v0' },
    generatedAt: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
  }
)

recommendationSchema.index({ userId: 1, generatedAt: -1 })

export const RecommendationModel =
  mongoose.models.Recommendation || mongoose.model<RecommendationDocument>('Recommendation', recommendationSchema)
