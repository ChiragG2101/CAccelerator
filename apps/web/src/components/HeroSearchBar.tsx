import Link from 'next/link'

export function HeroSearchBar() {
  return (
    <div className='panel mt-8 grid gap-3 p-3 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center'>
      <input
        aria-label='Target role'
        placeholder='Role e.g. Software Engineer'
        className='w-full rounded-xl border border-slate-700 bg-base-2/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30'
      />
      <input
        aria-label='Preferred location'
        placeholder='Location e.g. Remote, Bengaluru'
        className='w-full rounded-xl border border-slate-700 bg-base-2/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30'
      />
      <select
        aria-label='Work mode'
        defaultValue='Remote'
        className='w-full rounded-xl border border-slate-700 bg-base-2/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30'
      >
        <option>Remote</option>
        <option>Hybrid</option>
        <option>Onsite</option>
      </select>
      <Link
        href='/onboarding'
        className='inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-500'
      >
        Find matches
      </Link>
    </div>
  )
}
