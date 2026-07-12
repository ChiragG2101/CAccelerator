import Link from 'next/link'

import type { Recommendation } from '@/lib/types'

interface RecommendationCardProps {
  recommendation: Recommendation
  userId: string
}

export function RecommendationCard({ recommendation, userId }: RecommendationCardProps) {
  const job = recommendation.job

  return (
    <article className='rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5 shadow-lg'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-xl font-semibold text-slate-50'>{job?.title ?? 'Role unavailable'}</h2>
          <p className='mt-1 text-sm text-slate-300'>
            {job?.company} • {job?.location} • {job?.mode}
          </p>
        </div>
        <div className='rounded-full border border-emerald-300/30 bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-200'>
          {recommendation.score}% match
        </div>
      </div>

      <div className='mt-4 flex flex-wrap gap-2'>
        {recommendation.reasons.map((reason) => (
          <span key={reason} className='rounded-full border border-brand-300/30 bg-brand-500/15 px-3 py-1 text-xs text-brand-100'>
            {reason}
          </span>
        ))}
      </div>

      <div className='mt-4'>
        <p className='text-xs font-semibold uppercase tracking-wide text-amber-200'>Keyword gaps</p>
        <div className='mt-2 flex flex-wrap gap-2'>
          {recommendation.keywordGaps.map((keyword) => (
            <span key={keyword} className='rounded-md border border-amber-300/40 bg-amber-400/10 px-2 py-1 text-xs text-amber-100'>
              {keyword}
            </span>
          ))}
        </div>
      </div>

      <div className='mt-5 flex flex-wrap gap-3'>
        <Link
          href={`/recommendations/${recommendation.jobId}?userId=${encodeURIComponent(userId)}`}
          className='rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500'
        >
          Tailor resume
        </Link>
        {job?.applyUrl ? (
          <a
            href={job.applyUrl}
            target='_blank'
            rel='noreferrer'
            className='rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800/80'
          >
            View job
          </a>
        ) : null}
      </div>
    </article>
  )
}