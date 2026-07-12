interface FilterToolbarProps {
  keyword: string
  location: string
  mode: string
  sortBy: string
  locationOptions: string[]
  modeOptions: string[]
  onKeywordChange: (value: string) => void
  onLocationChange: (value: string) => void
  onModeChange: (value: string) => void
  onSortByChange: (value: string) => void
}

export function FilterToolbar({
  keyword,
  location,
  mode,
  sortBy,
  locationOptions,
  modeOptions,
  onKeywordChange,
  onLocationChange,
  onModeChange,
  onSortByChange,
}: FilterToolbarProps) {
  return (
    <section className='panel p-4'>
      <div className='grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]'>
        <input
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder='Search by role, company, or skill'
          aria-label='Search recommendations'
          className='w-full rounded-xl border border-slate-300 bg-base-2 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30'
        />

        <select
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
          aria-label='Filter by location'
          className='w-full rounded-xl border border-slate-300 bg-base-2 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30'
        >
          {locationOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={mode}
          onChange={(event) => onModeChange(event.target.value)}
          aria-label='Filter by work mode'
          className='w-full rounded-xl border border-slate-300 bg-base-2 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30'
        >
          {modeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value)}
          aria-label='Sort recommendations'
          className='w-full rounded-xl border border-slate-300 bg-base-2 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30'
        >
          <option value='match'>Best match</option>
          <option value='recent'>Most recent</option>
          <option value='company'>Company A-Z</option>
        </select>
      </div>
    </section>
  )
}
