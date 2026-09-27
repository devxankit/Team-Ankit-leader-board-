import { motion } from 'motion/react'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'
import { formatTotal, plural } from '@/lib/format'
import LevelBadge from './LevelBadge'
import LevelProgress from './LevelProgress'
import TrendBadge from './TrendBadge'

const RANK_COLORS = { 1: 'text-gold', 2: 'text-silver', 3: 'text-bronze' }

function StandingRow({ row, isMe, onSelect }) {
  return (
    // `layout` animates rows into their new place when a live update re-ranks them.
    <motion.li layout transition={{ type: 'spring', stiffness: 420, damping: 38 }}>
      <button
        type="button"
        onClick={() => onSelect(row.member.id)}
        className={cn(
          'flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-subtle/70 sm:gap-4 sm:px-5',
          isMe && 'bg-accent/[0.07] shadow-[inset_3px_0_0_var(--accent)]'
        )}
      >
        <div className="flex w-8 shrink-0 flex-col items-center gap-1 sm:w-10">
          <span
            className={cn(
              'font-display text-2xl font-extrabold leading-none tabular sm:text-3xl',
              RANK_COLORS[row.rank] ?? 'text-muted'
            )}
          >
            {row.rank}
          </span>
          <TrendBadge trend={row.trend} />
        </div>

        <Avatar name={row.member.name} color={row.member.avatarColor} size="md" className="hidden min-[380px]:inline-flex" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-semibold">{row.member.name}</p>
            {isMe && (
              <span className="shrink-0 rounded bg-accent px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wider text-accent-ink">
                You
              </span>
            )}
            {row.onFire && (
              <span className="shrink-0" title="On fire: 3+ rewards and no penalties in the last 7 days">
                🔥
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted">{row.member.designation || 'Team member'}</p>
          <div className="mt-2 flex items-start gap-2.5">
            <LevelBadge level={row.level} />
            <LevelProgress level={row.level} className="min-w-0 flex-1 pt-1 sm:max-w-48" />
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-display text-3xl font-extrabold leading-none tabular sm:text-4xl">
            {formatTotal(row.points)}
          </p>
          <p className="mt-1.5 text-[11px] font-bold tabular">
            <span className="text-reward" title="Rewards">
              ▲{row.rewards}
            </span>{' '}
            <span className="text-penalty" title="Penalties">
              ▼{row.penalties}
            </span>
          </p>
        </div>
      </button>
    </motion.li>
  )
}

export default function Standings({ rows, meId, periodLabel, onSelect }) {
  return (
    <section className="card overflow-hidden" aria-label="Standings">
      <header className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
        <h2 className="font-semibold">Standings</h2>
        <span className="text-xs text-muted">
          {periodLabel} · {plural(rows.length, 'member')}
        </span>
      </header>
      <ol className="divide-y divide-line">
        {rows.map((row) => (
          <StandingRow key={row.member.id} row={row} isMe={row.member.id === meId} onSelect={onSelect} />
        ))}
      </ol>
    </section>
  )
}
