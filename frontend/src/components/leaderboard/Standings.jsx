import { motion } from 'motion/react'
import AnimatedNumber from '@/components/ui/AnimatedNumber'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'
import { plural } from '@/lib/format'
import Flame from './Flame'
import FloatingDelta from './FloatingDelta'
import LevelBadge from './LevelBadge'
import LevelProgress from './LevelProgress'
import TrendBadge from './TrendBadge'

const MEDALS = {
  1: 'from-[#fff3c4] via-gold to-[#b45309] text-[#422006]',
  2: 'from-white via-silver to-[#64748b] text-[#1e293b]',
  3: 'from-[#ffe1c2] via-bronze to-[#7c2d12] text-[#2a1206]',
}

const ROW_TINTS = {
  1: 'bg-gradient-to-r from-gold/15 via-gold/5 to-transparent',
  2: 'bg-gradient-to-r from-silver/15 via-silver/5 to-transparent',
  3: 'bg-gradient-to-r from-bronze/15 via-bronze/5 to-transparent',
}

function RankBadge({ rank }) {
  if (MEDALS[rank]) {
    return (
      <span
        className={cn(
          'relative grid size-10 place-items-center overflow-hidden rounded-full bg-gradient-to-br font-display text-xl font-black shadow-md ring-2 ring-white/25 sm:size-11 sm:text-2xl',
          MEDALS[rank]
        )}
      >
        <span aria-hidden="true" className="shine absolute inset-0" />
        <span className="relative">{rank}</span>
      </span>
    )
  }
  return <span className="font-display text-2xl font-extrabold leading-none text-muted tabular sm:text-3xl">{rank}</span>
}

function StandingRow({ row, isMe, delta, onSelect }) {
  return (
    // `layout` slides rows into their new place when a live update re-ranks them.
    <motion.li layout transition={{ type: 'spring', stiffness: 420, damping: 38 }} className="relative">
      {delta && (
        <span
          key={delta.id}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 animate-flash',
            delta.amount > 0 ? '[--accent:var(--reward)]' : '[--accent:var(--penalty)]'
          )}
        />
      )}
      <button
        type="button"
        onClick={() => onSelect(row.member.id)}
        className={cn(
          'relative flex w-full items-center gap-3 px-3 py-3.5 text-left transition hover:bg-subtle/70 sm:gap-4 sm:px-5',
          ROW_TINTS[row.rank],
          isMe && 'shadow-[inset_4px_0_0_var(--accent)]'
        )}
      >
        <div className="flex w-10 shrink-0 flex-col items-center gap-1 sm:w-12">
          <RankBadge rank={row.rank} />
          <TrendBadge trend={row.trend} />
        </div>

        <Avatar name={row.member.name} color={row.member.avatarColor} size="md" className="hidden min-[380px]:inline-flex" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-bold">{row.member.name}</p>
            {isMe && (
              <span className="shrink-0 rounded bg-accent px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wider text-accent-ink">
                You
              </span>
            )}
            {row.onFire && <Flame className="shrink-0" />}
          </div>
          <p className="truncate text-xs text-muted">{row.member.designation || 'Team member'}</p>
          <div className="mt-2 flex items-start gap-2.5">
            <LevelBadge level={row.level} />
            <LevelProgress level={row.level} className="min-w-0 flex-1 pt-1 sm:max-w-52" />
          </div>
        </div>

        <div className="relative shrink-0 text-right">
          <FloatingDelta delta={delta} className="-top-7 right-0" />
          <p className="font-display text-3xl font-black leading-none tabular sm:text-4xl">
            <AnimatedNumber value={row.points} />
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

export default function Standings({ rows, meId, deltas = {}, periodLabel, onSelect }) {
  return (
    <section className="card overflow-hidden" aria-label="Standings">
      <header className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide">Standings</h2>
        <span className="text-xs font-medium text-muted">
          {periodLabel} · {plural(rows.length, 'member')}
        </span>
      </header>
      <ol className="divide-y divide-line">
        {rows.map((row) => (
          <StandingRow
            key={row.member.id}
            row={row}
            isMe={row.member.id === meId}
            delta={deltas[row.member.id]}
            onSelect={onSelect}
          />
        ))}
      </ol>
    </section>
  )
}
