import { ArrowDown, ArrowUp } from 'lucide-react'

/** Rank movement vs 7 days ago: ▲2 / ▼1 / – / NEW. */
export default function TrendBadge({ trend }) {
  if (trend === null) {
    return (
      <span className="rounded bg-accent/15 px-1 py-px text-[9px] font-extrabold uppercase tracking-wider text-accent">
        New
      </span>
    )
  }

  if (trend === 0) {
    return (
      <span className="text-xs font-bold text-muted" title="Same rank as 7 days ago">
        –<span className="sr-only">no change</span>
      </span>
    )
  }

  const up = trend > 0
  const Icon = up ? ArrowUp : ArrowDown
  const places = Math.abs(trend)
  return (
    <span
      className={`inline-flex items-center text-xs font-bold tabular ${up ? 'text-reward' : 'text-penalty'}`}
      title={`${up ? 'Up' : 'Down'} ${places} since 7 days ago`}
    >
      <Icon className="size-3" strokeWidth={3} aria-hidden="true" />
      {places}
      <span className="sr-only">{up ? ' places up' : ' places down'}</span>
    </span>
  )
}
