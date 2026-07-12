import type { Candidate, CandidatePersona, CandidateProfile, JobOpening, Recommendation, RecommendationsResponse, TailorResumeResponse } from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
type ApiEnvelope<T> = T | { data: T; requestId?: string }
type ApiErrorBody = { error?: { message?: string; code?: string }; requestId?: string }
const authHeaders = (token?: string | null): HeadersInit => token ? { Authorization: `Bearer ${token}` } : {}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | ApiErrorBody | null
  if (!response.ok) {
    const error = body as ApiErrorBody | null
    const detail = error?.error?.message ?? response.statusText ?? 'Request failed'
    throw new Error(`${detail}${error?.requestId ? ` (request ${error.requestId})` : ''}`)
  }
  if (body && typeof body === 'object' && 'data' in body) return body.data
  return body as T
}

export interface CandidateProfilePayload {
  resumeText?: string
  targetRole: string
  preferredLocations: string[]
  workModes: Array<'remote' | 'hybrid' | 'onsite'>
}

export interface PersonaParseResult {
  source: 'resume' | 'linkedin'
  persona: CandidatePersona
  provenance: Record<string, unknown>
}

export async function parseResume(file: File, payload: CandidateProfilePayload): Promise<PersonaParseResult> {
  const form = new FormData()
  form.append('resume', file)
  form.append('targetRole', payload.targetRole)
  payload.preferredLocations.forEach((location) => form.append('preferredLocations', location))
  payload.workModes.forEach((mode) => form.append('workModes', mode))
  return parseJsonResponse<PersonaParseResult>(await fetch(`${API_BASE}/v1/parse/resume`, { method: 'POST', body: form }))
}

export async function parseLinkedIn(linkedinUrl: string, payload: CandidateProfilePayload): Promise<PersonaParseResult> {
  return parseJsonResponse<PersonaParseResult>(await fetch(`${API_BASE}/v1/parse/linkedin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ linkedinUrl, targetRole: payload.targetRole, preferredLocations: payload.preferredLocations, workModes: payload.workModes }),
  }))
}

export async function resolveCandidate(token?: string | null): Promise<Candidate> {
  return parseJsonResponse<Candidate>(await fetch(`${API_BASE}/v1/candidates`, { method: 'POST', headers: authHeaders(token) }))
}

export async function saveCandidateProfile(candidateId: string, payload: CandidateProfilePayload, token?: string | null): Promise<CandidateProfile> {
  const response = await fetch(`${API_BASE}/v1/candidates/${encodeURIComponent(candidateId)}/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders(token) }, body: JSON.stringify(payload) })
  return parseJsonResponse<CandidateProfile>(response)
}

export async function uploadCandidateResume(candidateId: string, file: File, payload: CandidateProfilePayload, token?: string | null): Promise<CandidateProfile> {
  const form = new FormData()
  form.append('resume', file)
  form.append('targetRole', payload.targetRole)
  payload.preferredLocations.forEach((location) => form.append('preferredLocations', location))
  payload.workModes.forEach((mode) => form.append('workModes', mode))
  const response = await fetch(`${API_BASE}/v1/candidates/${encodeURIComponent(candidateId)}/resume`, { method: 'POST', headers: authHeaders(token), body: form })
  return parseJsonResponse<CandidateProfile>(response)
}

interface BackendJob { id: string; title: string; company: string; location: string; workMode: 'remote' | 'hybrid' | 'onsite' | 'unknown'; description: string; skills: string[]; applyUrl: string }
const toJobOpening = (job: BackendJob): JobOpening => ({ id: job.id, title: job.title, company: job.company, location: job.location, mode: job.workMode === 'remote' ? 'Remote' : job.workMode === 'hybrid' ? 'Hybrid' : 'Onsite', salaryRange: 'Not disclosed', postedAt: 'Recently', applyUrl: job.applyUrl, description: job.description, mustHaveSkills: job.skills })

export async function getRecommendations(userId: string, token?: string | null): Promise<RecommendationsResponse> {
  const response = await fetch(`${API_BASE}/v1/candidates/${encodeURIComponent(userId)}/recommendations`, { headers: authHeaders(token), cache: 'no-store' })
  const rows = await parseJsonResponse<Array<{ id: string; score: number; reasons: string[]; missingSkills: string[]; job: BackendJob }>>(response)
  const recommendations: Recommendation[] = rows.map((row) => ({ id: row.id, userId, jobId: row.job.id, score: row.score, reasons: row.reasons, keywordGaps: row.missingSkills, job: toJobOpening(row.job) }))
  return { userId, recommendations, source: 'api' }
}

export async function getJobById(jobId: string, token?: string | null): Promise<JobOpening> {
  return toJobOpening(await parseJsonResponse<BackendJob>(await fetch(`${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}`, { headers: authHeaders(token), cache: 'no-store' })))
}

export async function tailorResume(userId: string, jobId: string, token?: string | null): Promise<TailorResumeResponse> {
  const response = await fetch(`${API_BASE}/v1/candidates/${encodeURIComponent(userId)}/tailored-resumes`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(token) }, body: JSON.stringify({ jobId }) })
  const result = await parseJsonResponse<{ output: Omit<TailorResumeResponse['tailored'], 'jobId'> }>(response)
  return { userId, tailored: { ...result.output, jobId }, source: 'api' }
}

export async function trackEvent(userId: string, type: string, metadata?: Record<string, unknown>, token?: string | null) {
  const response = await fetch(`${API_BASE}/v1/events`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(token) }, body: JSON.stringify({ candidateId: userId, type, metadata }) })
  return parseJsonResponse<{ ok: boolean }>(response)
}
