import type { CandidatePersona, ParseCandidateInput } from '../../runtimes/HermesRuntime.js'

const knownSkills = ['typescript', 'javascript', 'react', 'next.js', 'node.js', 'express', 'mongodb', 'sql', 'python', 'docker', 'playwright', 'accessibility', 'testing', 'apis', 'data modeling']

export function fallbackParse(input: ParseCandidateInput): CandidatePersona {
  const text = input.resumeText.toLowerCase()
  const skills = knownSkills.filter((skill) => text.includes(skill))
  const years = text.match(/(\d{1,2})\+?\s+years?/)?.[1]
  const headline = input.targetRole
  return {
    headline,
    summary: `Candidate targeting ${input.targetRole}; review resume-derived details before use.`,
    yearsExperience: years ? Number(years) : undefined,
    seniority: undefined,
    skills: skills.length ? skills : ['communication'],
    industries: [],
    currentRole: undefined,
    roles: [input.targetRole],
    locations: input.preferredLocations,
    education: [],
    experience: [],
    achievements: [],
    preferences: {
      targetRole: input.targetRole,
      preferredLocations: input.preferredLocations,
      workModes: input.workModes,
    },
  }
}
