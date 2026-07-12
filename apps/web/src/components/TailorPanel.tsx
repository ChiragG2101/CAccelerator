import type { TailoredResume } from '@/lib/types'

interface TailorPanelProps {
  tailored: TailoredResume
}

export function TailorPanel({ tailored }: TailorPanelProps) {
  const allContent = [
    `Headline: ${tailored.headline}`,
    '',
    `Summary: ${tailored.summary}`,
    '',
    'Tailored bullets:',
    ...tailored.bullets.map((item) => `- ${item}`),
    '',
    `Keywords to add: ${tailored.keywordsToAdd.join(', ')}`,
  ].join('\n')

  return (
    <section className='card'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-xl font-semibold text-slate-50'>Tailored resume output</h2>
          <p className='mt-1 text-xs text-slate-400'>Generated for this role. Edit language to match your voice.</p>
        </div>
        <button
          type='button'
          onClick={() => navigator.clipboard.writeText(allContent)}
          className='rounded-lg border border-slate-600 px-3 py-2 text-xs font-medium text-slate-100 transition hover:bg-slate-800/70'
        >
          Copy tailored resume
        </button>
      </div>

      <div className='mt-4 space-y-4 text-sm text-slate-200'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-brand-200'>Headline</p>
          <p className='mt-1 rounded-lg border border-slate-700/60 bg-base-2/60 p-3'>{tailored.headline}</p>
        </div>

        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-brand-200'>Summary</p>
          <p className='mt-1 rounded-lg border border-slate-700/60 bg-base-2/60 p-3'>{tailored.summary}</p>
        </div>

        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-brand-200'>Experience bullets</p>
          <ul className='mt-2 list-disc space-y-2 pl-5'>
            {tailored.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-amber-200'>Keywords to add</p>
          <div className='mt-2 flex flex-wrap gap-2'>
            {tailored.keywordsToAdd.map((keyword) => (
              <span key={keyword} className='rounded-md border border-amber-300/40 bg-amber-400/10 px-2 py-1 text-xs text-amber-100'>
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}