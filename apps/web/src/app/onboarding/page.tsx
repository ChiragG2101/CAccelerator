'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { CandidatePersonaReview } from '@/components/CandidatePersonaReview'
import { ResumeUpload } from '@/components/ResumeUpload'
import { StateError } from '@/components/StateError'
import { discoverJobs, resolveCandidate, uploadCandidateResume, type CandidateProfilePayload } from '@/lib/api'
import type { CandidateProfile, WorkMode } from '@/lib/types'

type Progress = 'idle' | 'parsing' | 'review' | 'discovering'
const modes: Array<{ value: WorkMode; label: string }> = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
]

export default function OnboardingPage() {
  const { getToken, isLoaded, userId } = useAuth()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [location, setLocation] = useState('Remote')
  const [workModes, setWorkModes] = useState<WorkMode[]>(['remote'])
  const [consent, setConsent] = useState(false)
  const [progress, setProgress] = useState<Progress>('idle')
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const busy = progress === 'parsing' || progress === 'discovering'
  const canSubmit = Boolean(isLoaded && userId && file && targetRole.trim() && location.trim() && workModes.length && consent)

  function toggleMode(mode: WorkMode) {
    setWorkModes((current) => current.includes(mode) ? current.filter((item) => item !== mode) : [...current, mode])
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file || !canSubmit) {
      setError('Sign in, add a PDF/DOCX resume and preferences, then provide consent.')
      return
    }

    try {
      setError(null)
      setProgress('parsing')
      const token = await getToken()
      if (!token) throw new Error('Your sign-in session expired. Please sign in again.')
      const candidate = await resolveCandidate(token)
      const payload: CandidateProfilePayload = {
        targetRole: targetRole.trim(),
        preferredLocations: [location.trim()],
        workModes,
      }
      const savedProfile = await uploadCandidateResume(candidate.id, file, payload, token)
      setProfile(savedProfile)
      setProgress('review')
    } catch (submitError) {
      setProgress('idle')
      setError(submitError instanceof Error ? submitError.message : 'Unable to process your resume right now.')
    }
  }

  async function handleConfirm() {
    if (!profile) return
    try {
      setError(null)
      setProgress('discovering')
      const token = await getToken()
      if (!token) throw new Error('Your sign-in session expired. Please sign in again.')
      await discoverJobs(profile.candidateId, token)
      router.push(`/recommendations?candidateId=${encodeURIComponent(profile.candidateId)}`)
    } catch (discoveryError) {
      setProgress('review')
      setError(discoveryError instanceof Error ? discoveryError.message : 'Unable to discover jobs right now.')
    }
  }

  if (profile && (progress === 'review' || progress === 'discovering')) {
    return (
      <main className='mx-auto max-w-3xl px-4 py-12'>
        {error ? <div className='mb-4'><StateError message={error} /></div> : null}
        <CandidatePersonaReview
          profile={profile}
          onBack={() => { setProfile(null); setProgress('idle'); setError(null) }}
          onConfirm={() => void handleConfirm()}
          isContinuing={progress === 'discovering'}
        />
      </main>
    )
  }

  return (
    <main className='mx-auto max-w-3xl px-4 py-12'>
      <header className='mb-8'>
        <p className='text-xs font-semibold uppercase tracking-wide text-brand-200'>Step 1 of 3</p>
        <h1 className='mt-2 text-3xl font-semibold tracking-tight text-slate-50'>Build your candidate profile</h1>
        <p className='mt-3 text-sm text-slate-300'>Your parser agent extracts verified profile facts. After review, a separate discovery agent searches and scores matching jobs.</p>
      </header>

      <form onSubmit={handleSubmit} className='space-y-6 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6'>
        <ResumeUpload file={file} onFileChange={setFile} disabled={busy} />
        <div className='grid gap-4 md:grid-cols-2'>
          <label className='space-y-2 text-sm font-medium text-slate-100'>Target role
            <input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} disabled={busy} className='w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-400' />
          </label>
          <label className='space-y-2 text-sm font-medium text-slate-100'>Preferred location
            <input value={location} onChange={(event) => setLocation(event.target.value)} disabled={busy} className='w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-400' />
          </label>
        </div>
        <fieldset disabled={busy}>
          <legend className='text-sm font-medium text-slate-100'>Work mode</legend>
          <div className='mt-3 flex flex-wrap gap-2'>
            {modes.map((mode) => <button key={mode.value} type='button' aria-pressed={workModes.includes(mode.value)} onClick={() => toggleMode(mode.value)} className={`rounded-full border px-4 py-2 text-sm transition ${workModes.includes(mode.value) ? 'border-brand-400 bg-brand-500/20 text-brand-100' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}`}>{mode.label}</button>)}
          </div>
        </fieldset>
        <label className='flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-950/30 p-4 text-sm text-slate-300'>
          <input type='checkbox' checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={busy} className='mt-1 h-4 w-4 accent-indigo-500' />
          <span>I consent to processing this resume through the dedicated Hermes parser. Raw resume content is not stored.</span>
        </label>
        {progress === 'parsing' ? <p className='rounded-xl border border-brand-400/30 bg-brand-500/10 p-4 text-sm font-medium text-brand-100'>Parsing and securely saving your candidate profile…</p> : null}
        {error ? <StateError message={error} /> : null}
        <button type='submit' disabled={!canSubmit || busy} className='w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-slate-600'>{progress === 'parsing' ? 'Analyzing resume…' : 'Analyze my resume'}</button>
      </form>
    </main>
  )
}
