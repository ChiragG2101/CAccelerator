import type {
  IngestProfileResponse,
  JobOpening,
  RecommendationsResponse,
  TailorResumeResponse,
} from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

export interface IngestProfilePayload {
  userId: string
  email?: string
  username?: string
  resumeText?: string
  linkedinUrl?: string
  manualSummary?: string
  targetRole?: string
  location?: string
}

export async function ingestProfile(payload: IngestProfilePayload): Promise<IngestProfileResponse> {
  const response = await fetch(`${API_BASE}/ingest/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseJsonResponse<IngestProfileResponse>(response)
}

export async function getRecommendations(userId: string): Promise<RecommendationsResponse> {
  const response = await fetch(`${API_BASE}/recommendations/${encodeURIComponent(userId)}`, {
    cache: 'no-store',
  })

  return parseJsonResponse<RecommendationsResponse>(response)
}

export async function getJobById(jobId: string): Promise<JobOpening> {
  const response = await fetch(`${API_BASE}/jobs/${encodeURIComponent(jobId)}`, {
    cache: 'no-store',
  })

  return parseJsonResponse<JobOpening>(response)
}

export async function tailorResume(userId: string, jobId: string): Promise<TailorResumeResponse> {
  const response = await fetch(`${API_BASE}/tailor-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, jobId }),
  })

  return parseJsonResponse<TailorResumeResponse>(response)
}

export async function trackEvent(userId: string, type: string, metadata?: Record<string, unknown>) {
  const response = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, type, metadata }),
  })

  return parseJsonResponse<{ ok: boolean }>(response)
}