import type { JobRecord } from '../domain.js'

const roles = [
  ['full-stack-engineer', 'Full Stack Engineer', ['typescript', 'react', 'node.js', 'mongodb']],
  ['frontend-engineer', 'Frontend Engineer', ['typescript', 'react', 'next.js', 'accessibility']],
  ['backend-engineer', 'Backend Engineer', ['node.js', 'typescript', 'express', 'mongodb']],
  ['software-engineer', 'Software Engineer', ['typescript', 'apis', 'sql', 'testing']],
  ['product-engineer', 'Product Engineer', ['react', 'node.js', 'product analytics', 'typescript']],
  ['platform-engineer', 'Platform Engineer', ['node.js', 'docker', 'ci/cd', 'observability']],
  ['data-engineer', 'Data Engineer', ['python', 'sql', 'etl', 'data modeling']],
  ['mobile-engineer', 'Mobile Engineer', ['react native', 'typescript', 'apis', 'testing']],
  ['qa-automation', 'QA Automation Engineer', ['typescript', 'playwright', 'testing', 'ci/cd']],
  ['developer-experience', 'Developer Experience Engineer', ['typescript', 'documentation', 'apis', 'node.js']],
] as const

export const seedJobs: JobRecord[] = roles.map(([id, title, skills], index) => ({
  id: `seed-${id}`,
  source: 'seed',
  externalId: id,
  title,
  company: ['Northstar Labs', 'Orbit Careers', 'SkillSpring'][index % 3],
  location: index % 3 === 0 ? 'Bengaluru, India' : 'Remote',
  workMode: index % 3 === 0 ? 'hybrid' : 'remote',
  description: `Build reliable candidate-facing products as a ${title} using ${skills.join(', ')}.`,
  skills: [...skills],
  minYearsExperience: index % 4 === 0 ? 4 : 2,
  applyUrl: `https://example.com/jobs/${id}`,
  isActive: true,
}))
