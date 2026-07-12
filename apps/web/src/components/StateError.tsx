interface StateErrorProps {
  message: string
  actionLabel?: string
  onRetry?: () => void
}

export function StateError({ message, actionLabel = 'Retry', onRetry }: StateErrorProps) {
  return (
    <div className='rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-100'>
      <p className='text-sm'>{message}</p>
      {onRetry ? (
        <button
          type='button'
          onClick={onRetry}
          className='mt-4 rounded-lg border border-rose-300/40 px-3 py-2 text-xs font-medium text-rose-100 transition hover:bg-rose-400/20'
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}