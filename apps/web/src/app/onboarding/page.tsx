'use client'

import { useState } from 'react'

import { CandidatePersonaReview } from '@/components/CandidatePersonaReview'
import { ResumeUpload } from '@/components/ResumeUpload'
import { StateError } from '@/components/StateError'
import { parseLinkedIn, parseResume, type CandidateProfilePayload } from '@/lib/api'
import type { CandidateProfile, WorkMode } from '@/lib/types'

type Progress = 'idle' | 'extracting' | 'parsing' | 'review'
const modes: Array<{ value: WorkMode; label: string }> = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
]

export default function OnboardingPage() {
  const [source, setSource] = useState<'resume' | 'linkedin'>('resume')
  const [file, setFile] = useState<File | null>(null)
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [location, setLocation] = useState('Remote')
  const [workModes, setWorkModes] = useState<WorkMode[]>(['remote'])
  const [consent, setConsent] = useState(false)
  const [progress, setProgress] = useState<Progress>('idle')
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isSubmitting = progress === 'extracting' || progress === 'parsing'
  const hasSource = source === 'resume' ? Boolean(file) : Boolean(linkedinUrl.trim())
  const canSubmit = hasSource && Boolean(targetRole.trim()) && Boolean(location.trim()) && workModes.length > 0 && consent

  function toggleMode(mode: WorkMode) {
    setWorkModes((current) => current.includes(mode) ? current.filter((item) => item !== mode) : [...current, mode])
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      setError(`Add a ${source === 'resume' ? 'PDF/DOCX resume' : 'LinkedIn profile URL'}, preferences, and consent to continue.`)
      return
    }

    try {
      setError(null)
      setProgress(source === 'resume' ? 'extracting' : 'parsing')
      const payload: CandidateProfilePayload = {
        targetRole: targetRole.trim(),
        preferredLocations: [location.trim()],
        workModes,
      }
      const result = source === 'resume'
        ? await parseResume(file!, payload)
        : await parseLinkedIn(linkedinUrl.trim(), payload)
      setProfile({ id: 'preview', candidateId: 'preview', parsed: result.persona, parseStatus: 'completed', parseVersion: 'hermes-preview', targetRole: payload.targetRole, preferredLocations: payload.preferredLocations, workModes: payload.workModes })
      setProgress('review')
    } catch (submitError) {
      setProgress('idle')
      setError(submitError instanceof Error ? submitError.message : 'Unable to process your resume right now.')
    }
  }

  function continueToMatches() { setProfile(null); setProgress('idle') }

  if (profile && progress === 'review') {
    return (
      <main className='mx-auto max-w-3xl px-4 py-12'>
        <CandidatePersonaReview profile={profile} onBack={() => { setProfile(null); setProgress('idle') }} onConfirm={continueToMatches} isContinuing={false} />
      </main>
    )
  }

  return (
    <main className='mx-auto max-w-3xl px-4 py-12'>
      <header className='mb-8'>
        <p className='text-xs font-semibold uppercase tracking-wide text-brand-200'>Step 1 of 3</p>
        <h1 className='mt-2 text-3xl font-semibold tracking-tight text-slate-50'>Build your candidate profile</h1>
        <p className='mt-3 text-sm text-slate-300'>Choose a resume upload or a public LinkedIn URL. Both routes produce the same Hermes-validated candidate persona.</p>
      </header>

      <form onSubmit={handleSubmit} className='space-y-6 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6'>
        <div className='grid grid-cols-2 gap-2 rounded-xl bg-slate-950/50 p-1'>
          {(['resume', 'linkedin'] as const).map((option) => <button key={option} type='button' onClick={() => setSource(option)} className={`rounded-lg px-3 py-2 text-sm font-medium ${source === option ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>{option === 'resume' ? 'Resume upload' : 'LinkedIn via Linkup'}</button>)}
        </div>
        {source === 'resume' ? (
          <ResumeUpload file={file} onFileChange={setFile} disabled={isSubmitting} />
        ) : (
          <div className='space-y-2'>
            <label htmlFor='linkedinUrl' className='block text-sm font-medium text-slate-100'>Public LinkedIn profile URL</label>
            <input id='linkedinUrl' type='url' value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} placeholder='https://www.linkedin.com/in/your-profile' disabled={isSubmitting} className='w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-400' />
            <p className='text-xs text-slate-400'>The backend sends this URL to Linkup. Your Linkup API key remains server-side.</p>
          </div>
        )}

        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <label htmlFor='targetRole' className='block text-sm font-medium text-slate-100'>Target role</label>
            <input id='targetRole' value={targetRole} onChange={(event) => setTargetRole(event.target.value)} disabled={isSubmitting} className='w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-400' />
          </div>
          <div className='space-y-2'>
            <label htmlFor='location' className='block text-sm font-medium text-slate-100'>Preferred location</label>
            <input id='location' value={location} onChange={(event) => setLocation(event.target.value)} disabled={isSubmitting} className='w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-400' />
          </div>
        </div>

        <fieldset disabled={isSubmitting}>
          <legend className='text-sm font-medium text-slate-100'>Work mode</legend>
          <div className='mt-3 flex flex-wrap gap-2'>
            {modes.map((mode) => (
              <button key={mode.value} type='button' aria-pressed={workModes.includes(mode.value)} onClick={() => toggleMode(mode.value)} className={`rounded-full border px-4 py-2 text-sm transition ${workModes.includes(mode.value) ? 'border-brand-400 bg-brand-500/20 text-brand-100' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}`}>
                {mode.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className='flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-950/30 p-4 text-sm text-slate-300'>
          <input type='checkbox' checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={isSubmitting} className='mt-1 h-4 w-4 accent-indigo-500' />
          <span>I consent to processing my selected source through Linkup (for LinkedIn) and Hermes to create a candidate persona.</span>
        </label>

        {isSubmitting ? (
          <div className='rounded-xl border border-brand-400/30 bg-brand-500/10 p-4' role='status' aria-live='polite'>
            <p className='text-sm font-medium text-brand-100'>{progress === 'extracting' ? 'Extracting resume content…' : 'Parsing your candidate persona with Hermes…'}</p>
            <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-slate-700'><div className='h-full w-2/3 animate-pulse rounded-full bg-brand-400' /></div>
            <p className='mt-2 text-xs text-slate-400'>Keep this page open. This usually takes less than a minute.</p>
          </div>
        ) : null}

        {error ? <StateError message={error} /> : null}

        <button type='submit' disabled={!canSubmit || isSubmitting} className='w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-slate-600'>
          {isSubmitting ? 'Building your profile…' : `Process ${source === 'resume' ? 'resume' : 'LinkedIn profile'}`}
        </button>
      </form>
    </main>
  )
}
