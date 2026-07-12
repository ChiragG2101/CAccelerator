interface StateEmptyProps {
  title: string
  description: string
}

export function StateEmpty({ title, description }: StateEmptyProps) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-7 text-center'>
      <h3 className='text-lg font-semibold text-slate-900'>{title}</h3>
      <p className='mt-2 text-sm text-slate-500'>{description}</p>
    </div>
  )
}