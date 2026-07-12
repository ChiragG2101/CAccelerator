export type DiscoveryChannel = 'target-company' | 'ats' | 'search-engine' | 'community'

export interface DiscoveryQueryTask {
  channel: DiscoveryChannel
  platform: string
  query: string
  rationale: string
  priority: number
}

export interface DiscoveryPlanInput {
  role: string
  location?: string
  seniority?: string
  skills?: string[]
  targetCompanies?: string[]
  atsPlatforms?: string[]
}

const DEFAULT_ATS_PLATFORMS = ['Greenhouse', 'Lever', 'Workday', 'Ashby', 'SmartRecruiters']

const ATS_SITE_PATTERNS: Record<string, string[]> = {
  Greenhouse: ['site:boards.greenhouse.io'],
  Lever: ['site:jobs.lever.co'],
  Workday: ['site:myworkdayjobs.com'],
  Ashby: ['site:jobs.ashbyhq.com'],
  SmartRecruiters: ['site:jobs.smartrecruiters.com'],
}

const COMMUNITY_SITES = ['site:wellfound.com/jobs', 'site:ycombinator.com/jobs', 'site:otta.com']

const ROLE_SYNONYMS: Record<string, string[]> = {
  'software engineer': ['software engineer', 'software developer', 'backend engineer', 'full stack engineer'],
  'data scientist': ['data scientist', 'machine learning engineer', 'ml engineer'],
  'product manager': ['product manager', 'technical product manager'],
}

export function buildDiscoveryQueryPlan(input: DiscoveryPlanInput): DiscoveryQueryTask[] {
  const normalizedRole = input.role.trim()
  const roleVariants = buildRoleVariants(normalizedRole)
  const location = (input.location ?? 'remote').trim()
  const seniority = input.seniority?.trim()
  const skills = sanitizeValues(input.skills)
  const companies = sanitizeValues(input.targetCompanies)
  const atsPlatforms = sanitizeValues(input.atsPlatforms).length
    ? sanitizeValues(input.atsPlatforms)
    : DEFAULT_ATS_PLATFORMS

  const tasks: DiscoveryQueryTask[] = []

  for (const company of companies) {
    tasks.push({
      channel: 'target-company',
      platform: 'company-careers',
      query: `"${company}" careers "${normalizedRole}" "${location}"`,
      rationale: 'Direct company hiring page discovery',
      priority: 100,
    })

    if (skills.length > 0) {
      tasks.push({
        channel: 'target-company',
        platform: 'company-careers',
        query: `"${company}" hiring ${skills.slice(0, 2).map((skill) => `"${skill}"`).join(' ')}`,
        rationale: 'Skill-led company hiring signal query',
        priority: 90,
      })
    }
  }

  for (const platform of atsPlatforms) {
    const sitePatterns = ATS_SITE_PATTERNS[platform] ?? []
    for (const sitePattern of sitePatterns) {
      const queryRole = roleVariants[0] ?? normalizedRole
      tasks.push({
        channel: 'ats',
        platform,
        query: `${sitePattern} "${queryRole}" "${location}"`,
        rationale: 'ATS board search for fresh openings',
        priority: 80,
      })

      if (seniority) {
        tasks.push({
          channel: 'ats',
          platform,
          query: `${sitePattern} "${queryRole}" "${seniority}"`,
          rationale: 'Seniority-specific ATS search',
          priority: 75,
        })
      }
    }
  }

  for (const roleVariant of roleVariants.slice(0, 3)) {
    const skillClause = skills.slice(0, 3).map((skill) => `"${skill}"`).join(' ')
    tasks.push({
      channel: 'search-engine',
      platform: 'google-style-web-search',
      query: `"${roleVariant}" "${location}" ${skillClause}`.trim(),
      rationale: 'Broad recall for poorly indexed listings',
      priority: 70,
    })
  }

  for (const communitySite of COMMUNITY_SITES) {
    tasks.push({
      channel: 'community',
      platform: 'community-job-board',
      query: `${communitySite} "${normalizedRole}" "${location}"`,
      rationale: 'Long-tail startup and community board coverage',
      priority: 60,
    })
  }

  return dedupeTasks(tasks)
}

function buildRoleVariants(role: string): string[] {
  const normalized = role.trim().toLowerCase()
  const synonyms = ROLE_SYNONYMS[normalized] ?? [role]
  return [...new Set([role, ...synonyms])]
}

function sanitizeValues(values?: string[]): string[] {
  if (!values) {
    return []
  }

  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

function dedupeTasks(tasks: DiscoveryQueryTask[]): DiscoveryQueryTask[] {
  const byQuery = new Map<string, DiscoveryQueryTask>()

  for (const task of tasks) {
    const key = task.query.toLowerCase()
    const existing = byQuery.get(key)
    if (!existing || task.priority > existing.priority) {
      byQuery.set(key, task)
    }
  }

  return [...byQuery.values()].sort((a, b) => b.priority - a.priority)
}
