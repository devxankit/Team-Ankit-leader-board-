import { Crown } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'
import { formatTotal } from '@/lib/format'
import LevelBadge from './LevelBadge'

const PLACES = {
  1: {
    block: 'h-28 sm:h-40 from-gold/35 via-gold/10 to-transparent border-gold/40',
    numeral: 'text-gold',
    ring: 'ring-gold',
  },
  2: {
    block: 'h-20 sm:h-28 from-silver/35 via-silver/10 to-transparent border-silver/40',
    numeral: 'text-silver',
    ring: 'ring-silver',
  },
  3: {
    block: 'h-16 sm:h-20 from-bronze/35 via-bronze/10 to-transparent border-bronze/40',
    numeral: 'text-bronze',
    ring: 'ring-bronze',
  },
}

function PodiumSpot({ row, place, isMe, onSelect }) {
  const style = PLACES[place]
  const first = place === 1

  return (
    <button
      type="button"
      onClick={() => onSelect(row.member.id)}
      className="group flex min-w-0 flex-col items-center text-center"
      aria-label={`${row.member.name}, rank ${row.rank}, ${row.points} points`}
    >
      <div className={cn('relative', first ? 'mb-3 mt-7' : 'mb-2.5')}>
        {first && (
          <Crown
            className="absolute -top-7 left-1/2 size-8 -translate-x-1/2 text-gold drop-shadow-[0_2px_6px_rgba(251,191,36,0.5)]"
            fill="currentColor"
            aria-hidden="true"
          />
        )}
        <Avatar
          name={row.member.name}
          color={row.member.avatarColor}
          size={first ? 'xl' : 'lg'}
          className={cn('ring-4 ring-offset-4 ring-offset-canvas transition group-hover:scale-105', style.ring)}
        />
        {row.onFire && (
          <span className="absolute -bottom-1 -right-1 text-lg" title="On fire" aria-hidden="true">
            🔥
          </span>
        )}
      </div>

      <p className="w-full truncate px-1 text-sm font-semibold sm:text-base">
        {row.member.name.split(' ')[0]}
        {isMe && <span className="text-accent"> (you)</span>}
      </p>
      <p className="mt-0.5 font-display text-3xl font-extrabold leading-none tabular sm:text-4xl">
        {formatTotal(row.points)}
        <span className="ml-1 font-sans text-[11px] font-semibold text-muted">pts</span>
      </p>
      <LevelBadge level={row.level} className="mt-2" />

      <div
        className={cn(
          'mt-3 flex w-full justify-center rounded-t-2xl border border-b-0 bg-gradient-to-b pt-2 sm:pt-3',
          style.block
        )}
      >
        <span className={cn('font-display text-5xl font-black leading-none sm:text-7xl', style.numeral)}>
          {row.rank}
        </span>
      </div>
    </button>
  )
}

/** Top three: #2 left, #1 centre (tallest, crowned), #3 right. */
export default function Podium({ rows, meId, onSelect }) {
  const [first, second, third] = rows
  const slots = [
    { row: second, place: 2 },
    { row: first, place: 1 },
    { row: third, place: 3 },
  ]

  return (
    <section aria-label="Top three" className="card overflow-hidden px-3 pt-6 sm:px-10">
      <div className="mx-auto grid max-w-2xl grid-cols-3 items-end gap-2 sm:gap-6">
        {slots.map(({ row, place }) =>
          row ? (
            <PodiumSpot key={row.member.id} row={row} place={place} isMe={row.member.id === meId} onSelect={onSelect} />
          ) : (
            <div key={place} />
          )
        )}
      </div>
    </section>
  )
}
