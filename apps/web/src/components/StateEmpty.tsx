interface StateEmptyProps {
  title: string
  description: string
}

export function StateEmpty({ title, description }: StateEmptyProps) {
  return (
    <div className='rounded-2xl border border-slate-700/70 bg-slate-900/50 p-7 text-center'>
      <h3 className='text-lg font-semibold text-slate-100'>{title}</h3>
      <p className='mt-2 text-sm text-slate-400'>{description}</p>
    </div>
  )
}