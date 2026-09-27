import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'
import { formatTotal } from '@/lib/format'
import { levelStyle } from '@/lib/levels'

const MAX_AVATARS = 5

function Station({ level, members, isFirst, isLast, onSelect }) {
  const style = levelStyle(level.key)
  const Icon = style.icon
  const shown = members.slice(0, MAX_AVATARS)
  const hidden = members.length - shown.length

  return (
    <li className="flex min-w-0 flex-col items-center">
      {/* Who's at this level, best first, stacked up from the road */}
      <div className="flex w-full flex-col-reverse items-center gap-1.5 pb-3">
        {shown.map((row) => (
          <button
            key={row.member.id}
            type="button"
            onClick={() => onSelect(row.member.id)}
            className="rounded-full"
            title={`${row.member.name} · ${formatTotal(row.allTimePoints)} pts`}
            aria-label={`${row.member.name}, ${level.name}, ${row.allTimePoints} points`}
          >
            <Avatar name={row.member.name} color={row.member.avatarColor} size="xs" className="ring-2 ring-surface" />
          </button>
        ))}
        {hidden > 0 && <span className="text-[11px] font-semibold text-muted">+{hidden}</span>}
      </div>

      <div className="relative flex w-full justify-center">
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-1/2 h-1 -translate-y-1/2 opacity-60',
            style.bar,
            isFirst ? 'left-1/2' : 'left-0',
            isLast ? 'right-1/2' : 'right-0'
          )}
        />
        <span className={cn('relative grid size-9 place-items-center rounded-full ring-4 ring-surface', style.chip)}>
          <Icon className="size-4" strokeWidth={2.5} />
        </span>
      </div>
      <p className="mt-2 text-xs font-semibold">{level.name}</p>
      <p className="text-[11px] text-muted">{level.min == null ? 'below 0' : `${formatTotal(level.min)}+`}</p>
    </li>
  )
}

/** Where everyone stands on the way from Warning to Legend (all-time points). */
export default function LevelRoad({ levels, rows, onSelect }) {
  if (!levels?.length || !rows.length) return null

  const byLevel = new Map(levels.map((level) => [level.key, []]))
  ;[...rows]
    .sort((a, b) => b.allTimePoints - a.allTimePoints)
    .forEach((row) => byLevel.get(row.level.key)?.push(row))

  return (
    <section className="card overflow-hidden" aria-label="Level road">
      <header className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
        <h2 className="font-semibold">Level road</h2>
        <span className="text-xs text-muted">All-time points</span>
      </header>
      <div className="overflow-x-auto px-4 py-5 sm:px-5">
        <ol className="grid min-w-[640px] grid-cols-7 items-end">
          {levels.map((level, index) => (
            <Station
              key={level.key}
              level={level}
              members={byLevel.get(level.key) ?? []}
              isFirst={index === 0}
              isLast={index === levels.length - 1}
              onSelect={onSelect}
            />
          ))}
        </ol>
      </div>
    </section>
  )
}
