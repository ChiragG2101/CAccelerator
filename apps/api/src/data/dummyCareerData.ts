export interface DummyParsedProfile {
  title: string
  yearsExperience: string
  skills: string[]
  targetRole: string
  targetLocation: string
  confidence: number
}

export interface DummyRecommendation {
  id: string
  userId: string
  jobId: string
  score: number
  reasons: string[]
  keywordGaps: string[]
}

export interface DummyJobOpening {
  id: string
  title: string
  company: string
  location: string
  mode: 'Remote' | 'Hybrid' | 'Onsite'
  salaryRange: string
  postedAt: string
  applyUrl: string
  description: string
  mustHaveSkills: string[]
}

export interface DummyTailorResult {
  jobId: string
  headline: string
  summary: string
  bullets: string[]
  keywordsToAdd: string[]
}

export const defaultParsedProfile: DummyParsedProfile = {
  title: 'Full Stack Engineer',
  yearsExperience: '3-5 years',
  skills: ['TypeScript', 'React', 'Node.js', 'REST APIs', 'PostgreSQL'],
  targetRole: 'Software Engineer',
  targetLocation: 'Remote',
  confidence: 0.84,
}

export const dummyJobs: DummyJobOpening[] = [
  {
    id: 'job_1',
    title: 'Frontend Engineer (Next.js)',
    company: 'Northstar Labs',
    location: 'Bengaluru, India',
    mode: 'Hybrid',
    salaryRange: '₹22L - ₹30L',
    postedAt: '2 days ago',
    applyUrl: 'https://example.com/jobs/job_1',
    description:
      'Build candidate-facing product experiences with Next.js, TypeScript, and Tailwind. Collaborate with product to deliver intuitive job-seeker flows.',
    mustHaveSkills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Accessibility'],
  },
  {
    id: 'job_2',
    title: 'Full Stack Developer (Node + React)',
    company: 'Orbit Careers',
    location: 'Remote',
    mode: 'Remote',
    salaryRange: '₹18L - ₹27L',
    postedAt: '1 day ago',
    applyUrl: 'https://example.com/jobs/job_2',
    description:
      'Own features across React frontend and Node backend. Ship reliable APIs and polished UI for high-growth hiring workflows.',
    mustHaveSkills: ['Node.js', 'TypeScript', 'React', 'Express', 'MongoDB'],
  },
  {
    id: 'job_3',
    title: 'Software Engineer, Career Intelligence',
    company: 'SkillSpring',
    location: 'Pune, India',
    mode: 'Onsite',
    salaryRange: '₹20L - ₹26L',
    postedAt: '4 days ago',
    applyUrl: 'https://example.com/jobs/job_3',
    description:
      'Develop matching algorithms and user-facing recommendation modules. Work with product analytics and AI-enhanced resume tools.',
    mustHaveSkills: ['TypeScript', 'APIs', 'Data Modeling', 'Recommendation Systems', 'SQL'],
  },
]

export function buildRecommendations(userId: string): DummyRecommendation[] {
  return [
    {
      id: 'rec_1',
      userId,
      jobId: 'job_2',
      score: 91,
      reasons: ['Strong Node.js + React overlap', 'Relevant TypeScript experience', 'Remote preference match'],
      keywordGaps: ['CI/CD', 'System Design'],
    },
    {
      id: 'rec_2',
      userId,
      jobId: 'job_1',
      score: 87,
      reasons: ['Excellent frontend skills fit', 'Tailwind + Next.js alignment', 'Product experience'],
      keywordGaps: ['Web Performance'],
    },
    {
      id: 'rec_3',
      userId,
      jobId: 'job_3',
      score: 79,
      reasons: ['Strong TypeScript fundamentals', 'API design experience'],
      keywordGaps: ['Recommendation systems'],
    },
  ]
}

export function buildTailorResult(job: DummyJobOpening, baseSummary?: string): DummyTailorResult {
  return {
    jobId: job.id,
    headline: `${job.title} candidate with strong TypeScript + product delivery focus`,
    summary:
      baseSummary ||
      `Engineered user-facing and API-backed features with emphasis on reliability, clean UX, and measurable outcomes aligned to ${job.company}'s hiring goals.`,
    bullets: [
      `Delivered production-ready features using ${job.mustHaveSkills.slice(0, 3).join(', ')} with fast iteration cycles.`,
      'Collaborated cross-functionally with product and design to improve conversion on core user journeys.',
      'Improved application quality through structured testing, instrumentation, and release checklists.',
      'Translated ambiguous requirements into clear implementation plans and shipped on tight timelines.',
    ],
    keywordsToAdd: job.mustHaveSkills.slice(0, 5),
  }
}