import type { JobRecord, ProfileRecord, TailoredOutput } from '../../domain.js'

export function fallbackTailor(profile: ProfileRecord, job: JobRecord): TailoredOutput {
  const matched = job.skills.filter((skill) => profile.parsed.skills.some((candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase()))
  const gaps = job.skills.filter((skill) => !matched.includes(skill))
  return {
    headline: `${profile.targetRole} | ${matched.slice(0, 3).join(' · ') || 'Product delivery'}`,
    summary: `${profile.parsed.summary || profile.parsed.headline || profile.targetRole}. Interested in applying verified experience to ${job.company}'s ${job.title} role.`,
    bullets: [
      `Applied ${matched.slice(0, 3).join(', ') || 'relevant transferable skills'} to deliver reliable outcomes.`,
      `Worked toward ${profile.targetRole} responsibilities with a focus on quality and collaboration.`,
    ],
    keywordsToAdd: gaps,
    cautions: gaps.length ? ['Only add missing keywords when supported by your actual experience.'] : [],
  }
}
