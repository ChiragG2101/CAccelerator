export function StateSkeleton() {
  return (
    <div className='space-y-4'>
      {[0, 1, 2].map((item) => (
        <div key={item} className='animate-pulse rounded-2xl border border-slate-200 bg-white p-5'>
          <div className='h-5 w-2/3 rounded bg-slate-200' />
          <div className='mt-3 h-4 w-1/2 rounded bg-slate-200/80' />
          <div className='mt-4 h-3 w-full rounded bg-slate-200/70' />
          <div className='mt-2 h-3 w-5/6 rounded bg-slate-200/70' />
        </div>
      ))}
    </div>
  )
}