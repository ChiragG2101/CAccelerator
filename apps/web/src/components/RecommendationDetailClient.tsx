'use client'

import Link from 'next/link'
import { useState } from 'react'

import { StateError } from '@/components/StateError'
import { TailorPanel } from '@/components/TailorPanel'
import { tailorResume, trackEvent } from '@/lib/api'
import type { JobOpening, TailoredResume } from '@/lib/types'

interface RecommendationDetailClientProps {
  userId: string
  job: JobOpening
}

export function RecommendationDetailClient({ userId, job }: RecommendationDetailClientProps) {
  const [isTailoring, setIsTailoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tailored, setTailored] = useState<TailoredResume | null>(null)

  const postedAtLabel = new Date(job.postedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  async function handleTailor() {
    try {
      setIsTailoring(true)
      setError(null)

      const result = await tailorResume(userId, job.id)
      setTailored(result.tailored)

      await trackEvent(userId, 'tailor_resume_clicked', { jobId: job.id })
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
          <h1 className='mt-2 text-3xl font-semibold tracking-tight text-slate-50'>Role details and resume tailoring</h1>
        </div>
        <Link
          href='/recommendations'
          className='rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800/70'
        >
          Back to recommendations
        </Link>
      </header>

      {error ? <StateError message={error} /> : null}

      <section className='grid gap-5 lg:grid-cols-[1.7fr_1fr] lg:items-start'>
        <article className='card'>
          <h2 className='text-2xl font-semibold text-slate-50'>{job.title}</h2>
          <p className='mt-2 text-sm text-slate-300'>
            {job.company} • {job.location} • {job.mode}
          </p>
          <p className='mt-1 text-xs text-slate-400'>
            {job.salaryRange} • Posted {postedAtLabel}
          </p>

          <div className='mt-5'>
            <p className='text-xs font-semibold uppercase tracking-wide text-brand-200'>Must-have skills</p>
            <div className='mt-2 flex flex-wrap gap-2'>
              {job.mustHaveSkills.map((skill) => (
                <span key={skill} className='rounded-md border border-brand-300/30 bg-brand-500/15 px-2 py-1 text-xs text-brand-100'>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className='mt-5'>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-300'>Role overview</p>
            <p className='mt-2 text-sm leading-6 text-slate-200'>{job.description}</p>
          </div>
        </article>

        <aside className='card lg:sticky lg:top-24'>
          <p className='text-xs font-semibold uppercase tracking-wide text-brand-200'>Action panel</p>
          <h3 className='mt-2 text-lg font-semibold text-slate-50'>Tailor your resume to this role</h3>
          <p className='mt-2 text-sm text-slate-300'>Generate a role-focused headline, summary, and bullets aligned to this job.</p>

          <div className='mt-4 flex flex-col gap-3'>
            <button
              type='button'
              onClick={() => void handleTailor()}
              disabled={isTailoring}
              className='rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-slate-600'
            >
              {isTailoring ? 'Tailoring…' : 'Tailor resume'}
            </button>

            <a
              href={job.applyUrl}
              target='_blank'
              rel='noreferrer'
              className='rounded-xl border border-slate-600 px-4 py-2.5 text-center text-sm font-medium text-slate-100 transition hover:bg-slate-800/70'
            >
              Open application
            </a>
          </div>

          <div className='mt-5 rounded-xl border border-slate-700/70 bg-base-2/70 p-3 text-xs text-slate-300'>
            Use this output to improve ATS relevance before applying.
          </div>
        </aside>

        {tailored ? (
          <div className='lg:col-span-2'>
            <TailorPanel tailored={tailored} />
          </div>
        ) : null}
      </section>
    </main>
  )
}