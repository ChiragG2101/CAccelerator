'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { LinkedInInput } from '@/components/LinkedInInput'
import { ResumeUpload } from '@/components/ResumeUpload'
import { StateError } from '@/components/StateError'
import { ingestProfile } from '@/lib/api'

export default function OnboardingPage() {
  const { isLoaded, user } = useUser()
  const router = useRouter()
  const [resumeText, setResumeText] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [location, setLocation] = useState('Remote')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const userId = user?.id ?? ''

  const canSubmit = Boolean(userId) && Boolean(resumeText.trim() || linkedinUrl.trim())

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      setError('Please add user ID and either resume text or a LinkedIn URL.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      if (!userId) {
        throw new Error('You must be signed in to continue.')
      }

      await ingestProfile({
        userId,
        resumeText,
        linkedinUrl: linkedinUrl || undefined,
        targetRole,
        location,
      })

      router.push('/recommendations')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to analyze profile right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className='mx-auto max-w-3xl px-4 py-12'>
      <header className='mb-8'>
        <p className='text-xs font-semibold uppercase tracking-wide text-brand-200'>Step 1 of 3</p>
        <h1 className='mt-2 text-3xl font-semibold tracking-tight text-slate-50'>Tell us about your profile</h1>
        <p className='mt-3 text-sm text-slate-300'>
          Add your resume details and target preferences. We’ll use this to generate relevant job matches.
        </p>
        {isLoaded && user ? (
          <p className='mt-2 text-xs text-slate-400'>Signed in as {user.primaryEmailAddress?.emailAddress ?? user.id}</p>
        ) : null}
      </header>

      <form onSubmit={handleSubmit} className='space-y-6 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6'>
        <ResumeUpload value={resumeText} onChange={setResumeText} />
        <LinkedInInput value={linkedinUrl} onChange={setLinkedinUrl} />

        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-3'>
            <label htmlFor='targetRole' className='block text-sm font-medium text-slate-100'>
              Target role
            </label>
            <input
              id='targetRole'
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              className='w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/40'
            />
          </div>

          <div className='space-y-3'>
            <label htmlFor='location' className='block text-sm font-medium text-slate-100'>
              Preferred location
            </label>
            <input
              id='location'
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className='w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/40'
            />
          </div>
        </div>

        {error ? <StateError message={error} /> : null}

        <button
          type='submit'
          disabled={!canSubmit || isSubmitting || !isLoaded}
          className='w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-slate-600'
        >
          {isSubmitting ? 'Analyzing profile…' : 'Analyze my profile'}
        </button>
      </form>
    </main>
  )
}