import type {
  CandidatePersona,
  HermesRuntime,
  ParseCandidateInput,
  RuntimeContext,
  RuntimeHealth,
  RuntimeResult,
  TailorResumeInput,
  TailoredResumeOutput,
} from './HermesRuntime.js'

const unique = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))]

export interface FakeHermesRuntimeOptions {
  candidatePersona?: CandidatePersona
  tailoredResume?: TailoredResumeOutput
  health?: RuntimeHealth
}

/**
 * Deterministic test/local fixture. It performs no Hermes, network, or model calls.
 * Production composition roots must instantiate HttpHermesRuntime instead.
 */
export class FakeHermesRuntime implements HermesRuntime {
  constructor(private readonly options: FakeHermesRuntimeOptions = {}) {}

  async parseCandidate(input: ParseCandidateInput, _context: RuntimeContext): Promise<RuntimeResult<CandidatePersona>> {
    if (this.options.candidatePersona) return { data: structuredClone(this.options.candidatePersona) }

    const source = input.resumeText.toLowerCase()
    const knownSkills = ['javascript', 'typescript', 'node.js', 'react', 'python', 'sql', 'mongodb', 'aws']
    const skills = knownSkills.filter((skill) => source.includes(skill))

    return {
      data: {
        headline: input.targetRole.trim(),
        summary: skills.length > 0
          ? `${input.targetRole.trim()} with resume-evidenced experience in ${skills.join(', ')}.`
          : `${input.targetRole.trim()} candidate.`,
        skills,
        industries: [],
        roles: unique([input.targetRole]),
        locations: [],
        education: [],
        experience: [],
        achievements: [],
        preferences: {
          targetRole: input.targetRole.trim(),
          preferredLocations: unique(input.preferredLocations),
          workModes: [...input.workModes],
        },
      },
    }
  }

  async tailorResume(input: TailorResumeInput, _context: RuntimeContext): Promise<RuntimeResult<TailoredResumeOutput>> {
    if (this.options.tailoredResume) return { data: structuredClone(this.options.tailoredResume) }

    const candidateSkills = new Set(input.candidate.skills.map((skill) => skill.toLowerCase()))
    const matched = input.job.skills.filter((skill) => candidateSkills.has(skill.toLowerCase()))
    const missing = input.job.skills.filter((skill) => !candidateSkills.has(skill.toLowerCase()))
    const role = input.candidate.roles[0] ?? input.job.title

    return {
      data: {
        headline: `${role} targeting ${input.job.title}`,
        summary: `Candidate for ${input.job.title} at ${input.job.company} with experience in ${matched.join(', ') || 'relevant transferable skills'}.`,
        bullets: matched.map((skill) => `Applied ${skill} in prior work.`),
        keywordsToAdd: missing,
        cautions: missing.map((skill) => `Only add ${skill} if supported by verified experience.`),
      },
    }
  }

  async health(): Promise<RuntimeHealth> {
    return structuredClone(this.options.health ?? { status: 'healthy', detail: 'fake runtime (test/local fixture only)' })
  }
}
