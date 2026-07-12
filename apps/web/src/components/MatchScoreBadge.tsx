interface MatchScoreBadgeProps {
  score: number
}

export function MatchScoreBadge({ score }: MatchScoreBadgeProps) {
  const toneClass =
    score >= 90
      ? 'border-success/40 bg-success/10 text-emerald-700'
      : score >= 75
        ? 'border-brand-300/40 bg-brand-50 text-brand-700'
        : 'border-warning/40 bg-warning/10 text-amber-700'

  return (
    <div className={`rounded-full border px-3 py-1 text-sm font-semibold ${toneClass}`}>{score}% match</div>
  )
}
