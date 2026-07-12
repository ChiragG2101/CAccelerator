interface StateErrorProps {
  message: string
  actionLabel?: string
  onRetry?: () => void
}

export function StateError({ message, actionLabel = 'Retry', onRetry }: StateErrorProps) {
  return (
    <div className='rounded-2xl border border-rose-300/40 bg-rose-50 p-5 text-rose-700'>
      <p className='text-sm'>{message}</p>
      {onRetry ? (
        <button
          type='button'
          onClick={onRetry}
          className='mt-4 rounded-lg border border-rose-300/60 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100'
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}