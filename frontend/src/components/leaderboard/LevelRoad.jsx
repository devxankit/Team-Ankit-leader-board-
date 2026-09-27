import { motion } from 'motion/react'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'
import { formatTotal } from '@/lib/format'
import { levelStyle } from '@/lib/levels'

const MAX_AVATARS = 5

function Station({ level, members, isFirst, isLast, index, onSelect }) {
  const style = levelStyle(level.key)
  const Icon = style.icon
  const shown = members.slice(0, MAX_AVATARS)
  const hidden = members.length - shown.length

  return (
    <li className="flex min-w-0 flex-col items-center">
      {/* Who's at this level, best first */}
      <div className="flex min-h-28 w-full flex-col-reverse items-center justify-start gap-1.5 pb-3">
        {shown.map((row, i) => (
          <motion.button
            key={row.member.id}
            type="button"
            onClick={() => onSelect(row.member.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index + 0.04 * i }}
            className="rounded-full transition hover:-translate-y-1 hover:scale-110"
            title={`${row.member.name} · ${formatTotal(row.allTimePoints)} pts`}
            aria-label={`${row.member.name}, ${level.name}, ${row.allTimePoints} points`}
          >
            <Avatar name={row.member.name} color={row.member.avatarColor} size="sm" className="ring-2 ring-surface" />
          </motion.button>
        ))}
        {hidden > 0 && <span className="text-[11px] font-bold text-muted">+{hidden} more</span>}
      </div>

      {/* The road and its station */}
      <div className="relative flex w-full justify-center">
        <span
          aria-hidden="true"
          className={cn('absolute top-1/2 h-2 -translate-y-1/2 opacity-80', style.bar, isFirst ? 'left-1/2 rounded-l-full' : 'left-0', isLast ? 'right-1/2 rounded-r-full' : 'right-0')}
        />
        <span className={cn('relative grid size-12 place-items-center rounded-full ring-4 ring-surface', style.chip)}>
          <Icon className="size-5" strokeWidth={2.5} />
        </span>
      </div>
      <p className="mt-2 font-display text-lg font-extrabold uppercase tracking-wide">{level.name}</p>
      <p className="text-[11px] font-medium text-muted">{level.min == null ? 'below 0' : `${formatTotal(level.min)}+ pts`}</p>
    </li>
  )
}

/** Everyone's place on the journey from Warning to Legend (all-time points). */
export default function LevelRoad({ levels, rows, onSelect }) {
  if (!levels?.length || !rows.length) return null

  const byLevel = new Map(levels.map((level) => [level.key, []]))
  ;[...rows]
    .sort((a, b) => b.allTimePoints - a.allTimePoints)
    .forEach((row) => byLevel.get(row.level.key)?.push(row))

  return (
    <section aria-label="Level road" className="card relative overflow-hidden p-4 sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide">🛣️ Level road</h2>
          <p className="text-sm text-muted">Where everyone stands on the way to Legend — based on all-time points.</p>
        </div>
      </div>
      <div className="relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ol className="grid min-w-[720px] grid-cols-7 items-end">
          {levels.map((level, index) => (
            <Station
              key={level.key}
              level={level}
              members={byLevel.get(level.key) ?? []}
              isFirst={index === 0}
              isLast={index === levels.length - 1}
              index={index}
              onSelect={onSelect}
            />
          ))}
        </ol>
      </div>
    </section>
  )
}
