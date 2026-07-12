'use client'

import Link from 'next/link'

import { RecommendationCard } from '@/components/RecommendationCard'
import { StateEmpty } from '@/components/StateEmpty'
import type { Recommendation } from '@/lib/types'

interface RecommendationsClientProps {
  userId: string
  recommendations: Recommendation[]
}

export function RecommendationsClient({ userId, recommendations }: RecommendationsClientProps) {
  return (
    <main className='mx-auto max-w-6xl px-4 py-12'>
      <header className='mb-8 flex flex-wrap items-start justify-between gap-4'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-brand-200'>Step 2 of 3</p>
          <h1 className='mt-2 text-3xl font-semibold tracking-tight text-slate-50'>Top recommendations for {userId}</h1>
          <p className='mt-2 text-sm text-slate-300'>Ranked by profile fit with transparent match reasons.</p>
        </div>
        <Link
          href='/onboarding'
          className='rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800/70'
        >
          Edit profile inputs
        </Link>
      </header>

      {recommendations.length === 0 ? (
        <StateEmpty
          title='No recommendations yet'
          description='Try updating profile inputs with more skills, recent projects, or preferred role/location.'
        />
      ) : (
        <section className='grid gap-4'>
          {recommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} userId={userId} />
          ))}
        </section>
      )}
    </main>
  )
}