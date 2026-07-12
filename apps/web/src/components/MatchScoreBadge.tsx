interface MatchScoreBadgeProps {
  score: number
}

export function MatchScoreBadge({ score }: MatchScoreBadgeProps) {
  const toneClass =
    score >= 90
      ? 'border-success/40 bg-success/15 text-emerald-200'
      : score >= 75
        ? 'border-brand-300/40 bg-brand-500/15 text-brand-100'
        : 'border-warning/40 bg-warning/15 text-amber-200'

  return (
    <div className={`rounded-full border px-3 py-1 text-sm font-semibold ${toneClass}`}>{score}% match</div>
  )
}
