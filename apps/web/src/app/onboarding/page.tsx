'use client'

import { useState } from 'react'

import { CandidatePersonaReview } from '@/components/CandidatePersonaReview'
import { ResumeUpload } from '@/components/ResumeUpload'
import { StateError } from '@/components/StateError'
import { parseResume, type CandidateProfilePayload } from '@/lib/api'
import type { CandidateProfile, WorkMode } from '@/lib/types'

type Progress = 'idle' | 'extracting' | 'review'
const modes: Array<{ value: WorkMode; label: string }> = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
]

export default function OnboardingPage() {
  const [file, setFile] = useState<File | null>(null)
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [location, setLocation] = useState('Remote')
  const [workModes, setWorkModes] = useState<WorkMode[]>(['remote'])
  const [consent, setConsent] = useState(false)
  const [progress, setProgress] = useState<Progress>('idle')
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isSubmitting = progress === 'extracting'
  const canSubmit = Boolean(file && targetRole.trim() && location.trim() && workModes.length && consent)

  function toggleMode(mode: WorkMode) {
    setWorkModes((current) => current.includes(mode) ? current.filter((item) => item !== mode) : [...current, mode])
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file || !canSubmit) {
      setError('Add a PDF/DOCX resume, preferences, and consent to continue.')
      return
    }

    try {
      setError(null)
      setProgress('extracting')
      const payload: CandidateProfilePayload = {
        targetRole: targetRole.trim(),
        preferredLocations: [location.trim()],
        workModes,
      }
      const result = await parseResume(file, payload)
      setProfile({ id: 'preview', candidateId: 'preview', parsed: result.persona, parseStatus: 'completed', parseVersion: 'hermes-preview', ...payload })
      setProgress('review')
    } catch (submitError) {
      setProgress('idle')
      setError(submitError instanceof Error ? submitError.message : 'Unable to process your resume right now.')
    }
  }

  if (profile && progress === 'review') {
    return (
      <main className='mx-auto max-w-3xl px-4 py-12'>
        <CandidatePersonaReview profile={profile} onBack={() => { setProfile(null); setProgress('idle') }} onConfirm={() => { setProfile(null); setProgress('idle') }} isContinuing={false} />
      </main>
    )
  }

  return (
    <main className='mx-auto max-w-3xl px-4 py-12'>
      <header className='mb-8'>
        <p className='text-xs font-semibold uppercase tracking-wide text-brand-200'>Step 1 of 3</p>
        <h1 className='mt-2 text-3xl font-semibold tracking-tight text-slate-50'>Build your candidate profile</h1>
        <p className='mt-3 text-sm text-slate-300'>Upload your resume and choose the preferences used to build your Hermes-validated candidate persona.</p>
      </header>

      <form onSubmit={handleSubmit} className='space-y-6 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6'>
        <ResumeUpload file={file} onFileChange={setFile} disabled={isSubmitting} />
        <div className='grid gap-4 md:grid-cols-2'>
          <label className='space-y-2 text-sm font-medium text-slate-100'>Target role
            <input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} disabled={isSubmitting} className='w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-400' />
          </label>
          <label className='space-y-2 text-sm font-medium text-slate-100'>Preferred location
            <input value={location} onChange={(event) => setLocation(event.target.value)} disabled={isSubmitting} className='w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-400' />
          </label>
        </div>
        <fieldset disabled={isSubmitting}>
          <legend className='text-sm font-medium text-slate-100'>Work mode</legend>
          <div className='mt-3 flex flex-wrap gap-2'>
            {modes.map((mode) => <button key={mode.value} type='button' aria-pressed={workModes.includes(mode.value)} onClick={() => toggleMode(mode.value)} className={`rounded-full border px-4 py-2 text-sm transition ${workModes.includes(mode.value) ? 'border-brand-400 bg-brand-500/20 text-brand-100' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}`}>{mode.label}</button>)}
          </div>
        </fieldset>
        <label className='flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-950/30 p-4 text-sm text-slate-300'>
          <input type='checkbox' checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={isSubmitting} className='mt-1 h-4 w-4 accent-indigo-500' />
          <span>I consent to processing this resume through Hermes to create a candidate persona.</span>
        </label>
        {isSubmitting ? <p className='rounded-xl border border-brand-400/30 bg-brand-500/10 p-4 text-sm font-medium text-brand-100'>Extracting and parsing your resume with Hermes…</p> : null}
        {error ? <StateError message={error} /> : null}
        <button type='submit' disabled={!canSubmit || isSubmitting} className='w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-slate-600'>{isSubmitting ? 'Analyzing resume…' : 'Analyze my resume'}</button>
      </form>
    </main>
  )
}
