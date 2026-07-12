import type { CandidateProfile } from '@/lib/types'

interface CandidatePersonaReviewProps {
  profile: CandidateProfile
  onConfirm: () => void
  onBack: () => void
  isContinuing: boolean
}

export function CandidatePersonaReview({ profile, onConfirm, onBack, isContinuing }: CandidatePersonaReviewProps) {
  const persona = profile.parsed
  return (
    <section className='space-y-6 rounded-2xl border border-emerald-400/30 bg-slate-900/60 p-6' aria-labelledby='persona-heading'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-emerald-300'>Resume processed</p>
          <h2 id='persona-heading' className='mt-2 text-2xl font-semibold text-slate-50'>Review your candidate persona</h2>
          <p className='mt-2 text-sm text-slate-300'>Check the facts we will use to rank jobs. Go back and adjust your resume text if anything is missing.</p>
        </div>
        <span className='rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300'>
          {profile.parseStatus === 'fallback' ? 'Fallback parser' : 'Hermes parsed'}
        </span>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='rounded-xl border border-slate-700 bg-slate-950/40 p-4 md:col-span-2'>
          <p className='text-xs uppercase tracking-wide text-slate-500'>Headline</p>
          <p className='mt-2 text-base text-slate-100'>{persona.headline || 'No headline detected'}</p>
        </div>
        <div className='rounded-xl border border-slate-700 bg-slate-950/40 p-4'>
          <p className='text-xs uppercase tracking-wide text-slate-500'>Experience</p>
          <p className='mt-2 text-sm text-slate-100'>{persona.yearsExperience == null ? 'Not detected' : `${persona.yearsExperience} years`}</p>
        </div>
        <div className='rounded-xl border border-slate-700 bg-slate-950/40 p-4'>
          <p className='text-xs uppercase tracking-wide text-slate-500'>Roles</p>
          <p className='mt-2 text-sm text-slate-100'>{persona.roles.length ? persona.roles.join(', ') : 'No roles detected'}</p>
        </div>
      </div>

      <div>
        <p className='text-xs uppercase tracking-wide text-slate-500'>Skills</p>
        <div className='mt-2 flex flex-wrap gap-2'>
          {persona.skills.length ? persona.skills.map((skill) => <span key={skill} className='rounded-full bg-brand-500/15 px-3 py-1 text-xs text-brand-100'>{skill}</span>) : <span className='text-sm text-slate-400'>No skills detected</span>}
        </div>
      </div>

      <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
        <button type='button' onClick={onBack} disabled={isContinuing} className='rounded-xl border border-slate-600 px-4 py-3 text-sm font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-50'>Edit inputs</button>
        <button type='button' onClick={onConfirm} disabled={isContinuing} className='rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-500 disabled:bg-slate-600'>
          {isContinuing ? 'Ranking matches…' : 'Looks right — find my matches'}
        </button>
      </div>
    </section>
  )
}
