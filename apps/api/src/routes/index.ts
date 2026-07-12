import { Router } from 'express'
import { z } from 'zod'

import {
  buildRecommendations,
  buildTailorResult,
  defaultParsedProfile,
  dummyJobs,
} from '../data/dummyCareerData.js'

const router = Router()

const ingestedProfiles = new Map<string, typeof defaultParsedProfile & { resumeText?: string; linkedinUrl?: string }>()
const events: Array<{ userId: string; type: string; metadata?: Record<string, unknown>; createdAt: string }> = []

const ingestSchema = z.object({
  userId: z.string().min(2).default('demo-user-1'),
  resumeText: z.string().optional(),
  linkedinUrl: z.string().optional(),
  manualSummary: z.string().optional(),
  targetRole: z.string().optional(),
  location: z.string().optional(),
})

const tailorSchema = z.object({
  userId: z.string().min(2).default('demo-user-1'),
  jobId: z.string().min(1),
})

const eventsSchema = z.object({
  userId: z.string().min(2).default('demo-user-1'),
  type: z.string().min(2),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

type IngestPayload = z.infer<typeof ingestSchema>
type TailorPayload = z.infer<typeof tailorSchema>

router.get('/jobs', (_req, res) => {
  res.json({ jobs: dummyJobs })
})

router.get('/jobs/:jobId', (req, res) => {
  const job = dummyJobs.find((item) => item.id === req.params.jobId)
  if (!job) {
    return res.status(404).json({ error: 'Job not found' })
  }

  res.json(job)
})

router.post('/ingest/profile', (req, res) => {
  const parsed = ingestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const payload: IngestPayload = parsed.data
  const profile = {
    ...defaultParsedProfile,
    targetRole: payload.targetRole || defaultParsedProfile.targetRole,
    targetLocation: payload.location || defaultParsedProfile.targetLocation,
    resumeText: payload.resumeText || payload.manualSummary,
    linkedinUrl: payload.linkedinUrl,
  }

  ingestedProfiles.set(payload.userId, profile)

  res.status(201).json({
    userId: payload.userId,
    parsedProfile: profile,
    profileCompleteness: profile.resumeText || profile.linkedinUrl ? 0.86 : 0.62,
    source: 'dummy',
  })
})

router.get('/recommendations/:userId', (req, res) => {
  const recommendations = buildRecommendations(req.params.userId).map((rec) => {
    const job = dummyJobs.find((item) => item.id === rec.jobId)
    return {
      ...rec,
      job,
    }
  })

  res.json({
    userId: req.params.userId,
    recommendations,
    source: 'dummy',
  })
})

router.post('/tailor-resume', (req, res) => {
  const parsed = tailorSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const payload: TailorPayload = parsed.data
  const job = dummyJobs.find((item) => item.id === payload.jobId)

  if (!job) {
    return res.status(404).json({ error: 'Job not found' })
  }

  const profile = ingestedProfiles.get(payload.userId)
  const result = buildTailorResult(job, profile?.resumeText)

  res.json({
    userId: payload.userId,
    tailored: result,
    source: 'dummy',
  })
})

router.post('/events', (req, res) => {
  const parsed = eventsSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const event = {
    ...parsed.data,
    createdAt: new Date().toISOString(),
  }

  events.push(event)

  res.status(201).json({ ok: true, event, total: events.length, source: 'dummy' })
})

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'api' })
})

export default router