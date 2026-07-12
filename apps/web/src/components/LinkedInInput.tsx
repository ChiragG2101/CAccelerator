'use client'

interface LinkedInInputProps {
  value: string
  onChange: (value: string) => void
}

export function LinkedInInput({ value, onChange }: LinkedInInputProps) {
  return (
    <div className='space-y-3'>
      <label htmlFor='linkedinUrl' className='block text-sm font-medium text-slate-100'>
        LinkedIn profile URL (optional)
      </label>
      <input
        id='linkedinUrl'
        type='url'
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder='https://www.linkedin.com/in/your-profile'
        className='w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/40'
      />
    </div>
  )
}