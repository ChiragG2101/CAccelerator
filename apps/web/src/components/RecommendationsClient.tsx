'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { FilterToolbar } from '@/components/FilterToolbar'
import { RecommendationCard } from '@/components/RecommendationCard'
import { StateEmpty } from '@/components/StateEmpty'
import type { Recommendation } from '@/lib/types'

interface RecommendationsClientProps {
  recommendations: Recommendation[]
}

export function RecommendationsClient({ recommendations }: RecommendationsClientProps) {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('All locations')
  const [mode, setMode] = useState('All modes')
  const [sortBy, setSortBy] = useState('match')

  const locationOptions = useMemo<string[]>(() => {
    const values = recommendations.flatMap((item) => (item.job?.location ? [item.job.location] : []))
    const uniqueValues = Array.from(new Set(values))
    return ['All locations', ...uniqueValues]
  }, [recommendations])

  const modeOptions = useMemo<string[]>(() => {
    const values = recommendations.flatMap((item) => (item.job?.mode ? [item.job.mode] : []))
    const uniqueValues = Array.from(new Set(values))
    return ['All modes', ...uniqueValues]
  }, [recommendations])

  const filteredRecommendations = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    const filtered = recommendations.filter((item) => {
      const title = item.job?.title ?? ''
      const company = item.job?.company ?? ''
      const reasons = item.reasons.join(' ')

      const keywordMatch =
        normalizedKeyword.length === 0 ||
        `${title} ${company} ${reasons}`.toLowerCase().includes(normalizedKeyword)

      const locationMatch = location === 'All locations' || item.job?.location === location
      const modeMatch = mode === 'All modes' || item.job?.mode === mode

      return keywordMatch && locationMatch && modeMatch
    })

    if (sortBy === 'recent') {
      return [...filtered].sort((a, b) => {
        const aTime = a.job?.postedAt ? new Date(a.job.postedAt).getTime() : 0
        const bTime = b.job?.postedAt ? new Date(b.job.postedAt).getTime() : 0
        return bTime - aTime
      })
    }

    if (sortBy === 'company') {
      return [...filtered].sort((a, b) => (a.job?.company ?? '').localeCompare(b.job?.company ?? ''))
    }

    return [...filtered].sort((a, b) => b.score - a.score)
  }, [keyword, location, mode, sortBy, recommendations])

  const hasActiveFilters = keyword.length > 0 || location !== 'All locations' || mode !== 'All modes' || sortBy !== 'match'

  function handleResetFilters() {
    setKeyword('')
    setLocation('All locations')
    setMode('All modes')
    setSortBy('match')
  }

  return (
    <main className='mx-auto max-w-6xl px-4 py-12'>
      <header className='mb-8 flex flex-wrap items-start justify-between gap-4'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-brand-700'>Step 2 of 3</p>
          <h1 className='mt-2 text-3xl font-semibold tracking-tight text-slate-900'>Top recommendations for your profile</h1>
          <p className='mt-2 text-sm text-slate-600'>Filter by relevance, location, and work mode. Matches are ranked transparently.</p>
        </div>
        <Link
          href='/onboarding'
          className='rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100'
        >
          Edit profile inputs
        </Link>
      </header>

      <FilterToolbar
        keyword={keyword}
        location={location}
        mode={mode}
        sortBy={sortBy}
        locationOptions={locationOptions}
        modeOptions={modeOptions}
        onKeywordChange={setKeyword}
        onLocationChange={setLocation}
        onModeChange={setMode}
        onSortByChange={setSortBy}
      />

      <section className='mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-base-1 px-4 py-3 text-sm text-slate-600'>
        <span className='font-medium text-slate-800'>Showing {filteredRecommendations.length} roles</span>
        {keyword ? (
          <span className='rounded-full border border-brand-300/40 bg-brand-50 px-3 py-1 text-xs text-brand-700'>
            Keyword: {keyword}
          </span>
        ) : null}
        {location !== 'All locations' ? (
          <span className='rounded-full border border-info/40 bg-info/10 px-3 py-1 text-xs text-cyan-700'>Location: {location}</span>
        ) : null}
        {mode !== 'All modes' ? (
          <span className='rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 bg-slate-100'>Mode: {mode}</span>
        ) : null}
        {hasActiveFilters ? (
          <button
            type='button'
            onClick={handleResetFilters}
            className='rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-800 transition hover:bg-slate-100'
          >
            Clear all
          </button>
        ) : null}
      </section>

      {filteredRecommendations.length === 0 ? (
        <StateEmpty
          title='No recommendations for current filters'
          description='Try clearing filters or updating profile inputs with more skills and role preferences.'
        />
      ) : (
        <section className='mt-4 grid gap-4'>
          {filteredRecommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </section>
      )}
    </main>
  )
}