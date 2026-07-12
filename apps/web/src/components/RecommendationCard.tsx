import Link from 'next/link'

import { MatchScoreBadge } from '@/components/MatchScoreBadge'
import type { Recommendation } from '@/lib/types'

interface RecommendationCardProps {
  recommendation: Recommendation
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const job = recommendation.job
  const visibleReasons = recommendation.reasons.slice(0, 3)
  const hiddenReasonCount = Math.max(0, recommendation.reasons.length - visibleReasons.length)
  const visibleGaps = recommendation.keywordGaps.slice(0, 4)
  const hiddenGapCount = Math.max(0, recommendation.keywordGaps.length - visibleGaps.length)

  const postedAtLabel = job?.postedAt
    ? new Date(job.postedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown date'

  return (
    <article className='card'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-xl font-semibold text-slate-50'>{job?.title ?? 'Role unavailable'}</h2>
          <p className='mt-1 text-sm text-slate-300'>
            {job?.company} • {job?.location} • {job?.mode}
          </p>
          <p className='mt-1 text-xs text-slate-400'>
            {job?.salaryRange ?? 'Compensation not disclosed'} • Posted {postedAtLabel}
          </p>
        </div>
        <MatchScoreBadge score={recommendation.score} />
      </div>

      <div className='mt-4 flex flex-wrap gap-2'>
        {visibleReasons.map((reason) => (
          <span key={reason} className='rounded-full border border-brand-300/30 bg-brand-500/15 px-3 py-1 text-xs text-brand-100'>
            {reason}
          </span>
        ))}
        {hiddenReasonCount > 0 ? (
          <span className='rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300'>+{hiddenReasonCount} more</span>
        ) : null}
      </div>

      <div className='mt-4'>
        <p className='text-xs font-semibold uppercase tracking-wide text-amber-200'>Keyword gaps</p>
        <div className='mt-2 flex flex-wrap gap-2'>
          {visibleGaps.map((keyword) => (
            <span key={keyword} className='rounded-md border border-amber-300/40 bg-amber-400/10 px-2 py-1 text-xs text-amber-100'>
              {keyword}
            </span>
          ))}
          {hiddenGapCount > 0 ? (
            <span className='rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-300'>+{hiddenGapCount} more</span>
          ) : null}
        </div>
      </div>

      <div className='mt-5 flex flex-wrap gap-3'>
        <Link
          href={`/recommendations/${recommendation.jobId}`}
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