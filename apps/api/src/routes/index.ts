import { Router } from 'express'
import { z } from 'zod'

import {
  buildTailorResult,
  defaultParsedProfile,
  dummyJobs,
  type DummyJobOpening,
} from '../data/dummyCareerData.js'
import { InMemoryJobOpeningRepository } from '../repositories/jobOpeningRepository.js'
import { InMemoryRecommendationRepository } from '../repositories/recommendationRepository.js'
import { DiscoveryService } from '../services/discovery/discoveryService.js'
import { RecommendationService } from '../services/recommendation/recommendationService.js'

const router = Router()

const jobsRepository = new InMemoryJobOpeningRepository()
const recommendationRepository = new InMemoryRecommendationRepository()
const recommendationService = new RecommendationService(jobsRepository, recommendationRepository)
const discoveryService = new DiscoveryService(jobsRepository)

jobsRepository.seed(dummyJobs)

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

const discoveryUpsertSchema = z.object({
  runId: z.string().min(1),
  jobs: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      company: z.string().min(1),
      location: z.string().min(1),
      mode: z.enum(['Remote', 'Hybrid', 'Onsite']),
      salaryRange: z.string().min(1),
      postedAt: z.string().min(1),
      applyUrl: z.string().url(),
      description: z.string().min(1),
      mustHaveSkills: z.array(z.string()).default([]),
    })
  ),
})

const discoveryPlanSchema = z.object({
  role: z.string().min(2),
  location: z.string().optional(),
  seniority: z.string().optional(),
  skills: z.array(z.string().min(1)).optional(),
  targetCompanies: z.array(z.string().min(1)).optional(),
  atsPlatforms: z.array(z.string().min(1)).optional(),
})

type IngestPayload = z.infer<typeof ingestSchema>
type TailorPayload = z.infer<typeof tailorSchema>

router.get('/jobs', async (_req, res) => {
  const jobs = await jobsRepository.listActive()
  res.json({ jobs })
})

router.get('/jobs/:jobId', async (req, res) => {
  const job = await jobsRepository.getById(req.params.jobId)

  if (!job) {
    return res.status(404).json({ error: 'Job not found' })
  }

  res.json(job)
})

router.post('/discovery/jobs/upsert', async (req, res) => {
  const parsed = discoveryUpsertSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const payload = parsed.data
  const result = await discoveryService.ingestDiscoveredJobs({
    runId: payload.runId,
    jobs: payload.jobs as DummyJobOpening[],
  })

  res.status(202).json({
    ok: true,
    ...result,
  })
})

router.post('/discovery/plan', (req, res) => {
  const parsed = discoveryPlanSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const plan = discoveryService.buildQueryPlan(parsed.data)

  res.json({
    ok: true,
    ...plan,
  })
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

router.get('/recommendations/:userId', async (req, res) => {
  const profile = ingestedProfiles.get(req.params.userId)

  const recommendations = await recommendationService.getRecommendationsForUser(req.params.userId, {
    targetRole: profile?.targetRole,
    targetLocation: profile?.targetLocation,
  })

  res.json({
    userId: req.params.userId,
    recommendations,
    source: 'in-memory-foundation',
  })
})

router.post('/tailor-resume', async (req, res) => {
  const parsed = tailorSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const payload: TailorPayload = parsed.data
  const job = await jobsRepository.getById(payload.jobId)

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