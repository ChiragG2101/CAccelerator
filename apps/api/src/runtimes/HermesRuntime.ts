import { z } from 'zod'

export const workModeSchema = z.enum(['remote', 'hybrid', 'onsite'])

export const candidateExperienceSchema = z.object({
  company: z.string().min(1).optional(),
  title: z.string().min(1),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).optional(),
  bullets: z.array(z.string().min(1)),
}).strict()

export const candidatePersonaSchema = z.object({
  headline: z.string().min(1),
  summary: z.string().min(1),
  yearsExperience: z.number().nonnegative().optional(),
  seniority: z.string().min(1).optional(),
  skills: z.array(z.string().min(1)),
  industries: z.array(z.string().min(1)),
  currentRole: z.string().min(1).optional(),
  roles: z.array(z.string().min(1)),
  locations: z.array(z.string().min(1)),
  education: z.array(z.string().min(1)),
  experience: z.array(candidateExperienceSchema),
  achievements: z.array(z.string().min(1)),
  preferences: z.object({
    targetRole: z.string().min(1),
    preferredLocations: z.array(z.string().min(1)),
    workModes: z.array(workModeSchema),
  }).strict(),
}).strict()

export const tailoredResumeOutputSchema = z.object({
  headline: z.string().min(1),
  summary: z.string().min(1),
  bullets: z.array(z.string().min(1)),
  keywordsToAdd: z.array(z.string().min(1)),
  cautions: z.array(z.string().min(1)),
}).strict()

export type CandidatePersona = z.infer<typeof candidatePersonaSchema>
/** @deprecated Use CandidatePersona. */
export type ParsedCandidate = CandidatePersona
export type TailoredResumeOutput = z.infer<typeof tailoredResumeOutputSchema>

export interface ParseCandidateInput {
  /** Normalized server-extracted resume content; never a file path. */
  resumeText: string
  targetRole: string
  preferredLocations: string[]
  workModes: Array<'remote' | 'hybrid' | 'onsite'>
  extractionWarnings?: string[]
}

export interface TailorResumeInput {
  candidate: CandidatePersona
  job: { title: string; company: string; description: string; skills: string[] }
}

export interface RuntimeContext {
  requestId: string
}

export interface RuntimeResult<T> {
  data: T
  hermesSessionId?: string
}

export interface RuntimeHealth {
  status: 'healthy' | 'degraded' | 'unavailable'
  detail?: string
}

export type HermesRuntimeErrorCode =
  | 'HERMES_TIMEOUT'
  | 'HERMES_UNAVAILABLE'
  | 'HERMES_AUTH_FAILED'
  | 'HERMES_BAD_RESPONSE'

export class HermesRuntimeError extends Error {
  constructor(
    public readonly code: HermesRuntimeErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'HermesRuntimeError'
  }
}

export interface HermesRuntime {
  parseCandidate(input: ParseCandidateInput, context: RuntimeContext): Promise<RuntimeResult<CandidatePersona>>
  tailorResume(input: TailorResumeInput, context: RuntimeContext): Promise<RuntimeResult<TailoredResumeOutput>>
  health(): Promise<RuntimeHealth>
}
