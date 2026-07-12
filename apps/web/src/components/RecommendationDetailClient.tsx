'use client'

import Link from 'next/link'
import { useState } from 'react'

import { StateError } from '@/components/StateError'
import { TailorPanel } from '@/components/TailorPanel'
import { useApiSession } from '@/components/AuthShell'
import { tailorResume, trackEvent } from '@/lib/api'
import type { JobOpening, TailoredResume } from '@/lib/types'

interface RecommendationDetailClientProps {
  userId: string
  job: JobOpening
}

export function RecommendationDetailClient({ userId, job }: RecommendationDetailClientProps) {
  const { getToken } = useApiSession()
  const [isTailoring, setIsTailoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tailored, setTailored] = useState<TailoredResume | null>(null)

  async function handleTailor() {
    try {
      setIsTailoring(true)
      setError(null)

      const token = await getToken()
      const result = await tailorResume(userId, job.id, token)
      setTailored(result.tailored)

      await trackEvent(userId, 'tailoring_started', { jobId: job.id }, token)
    } catch (tailorError) {
      setError(tailorError instanceof Error ? tailorError.message : 'Unable to tailor resume right now.')
    } finally {
      setIsTailoring(false)
    }
  }

  return (
    <main className='mx-auto max-w-5xl px-4 py-12'>
      <header className='mb-6 flex flex-wrap items-start justify-between gap-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-brand-200'>Step 3 of 3</p>
          <h1 className='mt-2 text-3xl font-semibold tracking-tight text-slate-50'>Job recommendation detail</h1>
        </div>
        <Link
          href={`/recommendations?userId=${encodeURIComponent(userId)}`}
          className='rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800/70'
        >
          Back to recommendations
        </Link>
      </header>

      {error ? <StateError message={error} /> : null}

      <section className='space-y-5'>
        <article className='rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6'>
          <h2 className='text-2xl font-semibold text-slate-50'>{job.title}</h2>
          <p className='mt-2 text-sm text-slate-300'>
            {job.company} • {job.location} • {job.mode}
          </p>

          <div className='mt-4 flex flex-wrap gap-2'>
            {job.mustHaveSkills.map((skill) => (
              <span key={skill} className='rounded-md border border-brand-300/30 bg-brand-500/15 px-2 py-1 text-xs text-brand-100'>
                {skill}
              </span>
            ))}
          </div>

          <p className='mt-4 text-sm text-slate-200'>{job.description}</p>

          <div className='mt-5 flex flex-wrap gap-3'>
            <button
              type='button'
              onClick={() => void handleTailor()}
              disabled={isTailoring}
              className='rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-slate-600'
            >
              {isTailoring ? 'Tailoring…' : 'Tailor resume'}
            </button>

            <a
              href={job.applyUrl}
              target='_blank'
              rel='noreferrer'
              className='rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800/70'
            >
              Open application
            </a>
          </div>
        </article>

        {tailored ? <TailorPanel tailored={tailored} /> : null}
      </section>
    </main>
  )
}