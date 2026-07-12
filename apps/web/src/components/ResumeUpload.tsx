'use client'

interface ResumeUploadProps {
  value: string
  onChange: (value: string) => void
}

export function ResumeUpload({ value, onChange }: ResumeUploadProps) {
  return (
    <div className='space-y-3'>
      <label htmlFor='resumeText' className='block text-sm font-medium text-slate-100'>
        Resume text
      </label>
      <textarea
        id='resumeText'
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder='Paste your latest resume summary or key experience points...'
        className='h-40 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/40'
      />
      <p className='text-xs text-slate-400'>Tip: Include recent projects, stack, impact metrics, and target role.</p>
    </div>
  )
}