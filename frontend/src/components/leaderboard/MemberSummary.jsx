import { cn } from '@/lib/cn'
import { formatTotal } from '@/lib/format'
import LevelBadge from './LevelBadge'
import LevelProgress from './LevelProgress'
import TrendBadge from './TrendBadge'

function Stat({ label, value, children, tone }) {
  return (
    <div className="rounded-2xl border border-line bg-canvas/60 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span
          className={cn(
            'font-display text-3xl font-extrabold leading-none tabular',
            tone === 'reward' && 'text-reward',
            tone === 'penalty' && 'text-penalty'
          )}
        >
          {value}
        </span>
        {children}
      </div>
    </div>
  )
}

/** Rank, points, up/down counts and level for one leaderboard row. */
export default function MemberSummary({ row, periodLabel }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Rank" value={`#${row.rank}`}>
          <TrendBadge trend={row.trend} />
        </Stat>
        <Stat label={periodLabel} value={formatTotal(row.points)} />
        <Stat label="All time" value={formatTotal(row.allTimePoints)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Rewards" value={`▲${row.rewards}`} tone="reward" />
        <Stat label="Penalties" value={`▼${row.penalties}`} tone="penalty" />
      </div>
      <div className="rounded-2xl border border-line p-4">
        <div className="flex items-center justify-between gap-2">
          <LevelBadge level={row.level} size="md" />
          {row.onFire && <span className="text-sm font-semibold">🔥 On fire</span>}
        </div>
        <LevelProgress level={row.level} className="mt-3" />
      </div>
    </div>
  )
}
