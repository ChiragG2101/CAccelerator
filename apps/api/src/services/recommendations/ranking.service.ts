import type { JobRecord, ProfileRecord, RankingResult } from '../../domain.js'

const aliases: Record<string, string> = { js: 'javascript', ts: 'typescript', nodejs: 'node.js', node: 'node.js' }
const normalize = (value: string) => aliases[value.toLowerCase().trim().replace(/[^a-z0-9.+# ]/g, '')] ?? value.toLowerCase().trim().replace(/[^a-z0-9.+# ]/g, '')
const tokens = (value: string) => new Set(normalize(value).split(/\s+/).filter(Boolean))

export function rankJob(profile: ProfileRecord, job: JobRecord): RankingResult {
  const candidateSkills = new Set(profile.parsed.skills.map(normalize))
  const jobSkills = job.skills.map(normalize)
  const matchedSkills = jobSkills.filter((skill) => candidateSkills.has(skill))
  const missingSkills = jobSkills.filter((skill) => !candidateSkills.has(skill))
  const skill = jobSkills.length ? Math.round(40 * matchedSkills.length / jobSkills.length) : 20
  const targetTokens = tokens(profile.targetRole ?? profile.parsed.headline ?? profile.parsed.roles[0] ?? '')
  const titleTokens = tokens(job.title)
  const overlap = [...targetTokens].filter((token) => titleTokens.has(token)).length
  const title = targetTokens.size ? Math.round(25 * overlap / targetTokens.size) : 0
  const remote = profile.workModes.includes('remote') && job.workMode === 'remote'
  const location = remote || profile.preferredLocations.some((place) => normalize(job.location).includes(normalize(place))) ? 20 : profile.workModes.includes(job.workMode as never) ? 12 : 0
  const years = profile.parsed.yearsExperience
  const experience = years === undefined || job.minYearsExperience === undefined ? 8 : years >= job.minYearsExperience ? 15 : Math.max(0, 15 - (job.minYearsExperience - years) * 5)
  const score = Math.min(100, skill + title + location + experience)
  const reasons = [
    matchedSkills.length ? `Matches ${matchedSkills.slice(0, 3).join(', ')}` : 'Transferable profile fit',
    title > 0 ? 'Target role aligns with job title' : 'Adjacent role opportunity',
    location === 20 ? 'Work preference matches' : 'Review location preference',
  ]
  return { score, components: { skill, title, location, experience }, matchedSkills, missingSkills, reasons, rankingVersion: 'v1' }
}
