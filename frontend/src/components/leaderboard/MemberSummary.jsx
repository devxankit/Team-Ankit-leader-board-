import AnimatedNumber from '@/components/ui/AnimatedNumber'
import { cn } from '@/lib/cn'
import { formatTotal } from '@/lib/format'
import Flame from './Flame'
import LevelBadge from './LevelBadge'
import LevelProgress from './LevelProgress'
import TrendBadge from './TrendBadge'

function Stat({ label, value, format = formatTotal, children, tone }) {
  return (
    <div className="rounded-2xl border border-line bg-canvas/60 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <AnimatedNumber
          value={value}
          format={format}
          className={cn(
            'font-display text-3xl font-black leading-none tabular',
            tone === 'reward' && 'text-reward',
            tone === 'penalty' && 'text-penalty'
          )}
        />
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
        <Stat label="Rank" value={row.rank} format={(n) => `#${n}`}>
          <TrendBadge trend={row.trend} />
        </Stat>
        <Stat label={periodLabel} value={row.points} />
        <Stat label="All time" value={row.allTimePoints} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Rewards" value={row.rewards} format={(n) => `▲${n}`} tone="reward" />
        <Stat label="Penalties" value={row.penalties} format={(n) => `▼${n}`} tone="penalty" />
      </div>
      <div className="rounded-2xl border border-line p-4">
        <div className="flex items-center justify-between gap-2">
          <LevelBadge level={row.level} size="md" />
          {row.onFire && (
            <span className="flex items-center gap-1 text-sm font-semibold">
              <Flame /> On fire
            </span>
          )}
        </div>
        <LevelProgress level={row.level} className="mt-3" />
      </div>
    </div>
  )
}
