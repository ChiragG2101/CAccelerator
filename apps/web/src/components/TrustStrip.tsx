const trustItems = [
  '10k+ profiles analyzed',
  'Transparent match reasons',
  'Remote + hybrid roles',
  'Tailored resume output in 1 click',
]

export function TrustStrip() {
  return (
    <section className='mt-8 rounded-2xl border border-slate-700/60 bg-base-1/65 p-4'>
      <ul className='grid gap-3 text-xs text-slate-300 sm:grid-cols-2 md:grid-cols-4'>
        {trustItems.map((item) => (
          <li key={item} className='flex items-center gap-2'>
            <span className='h-2 w-2 rounded-full bg-info' aria-hidden='true' />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
