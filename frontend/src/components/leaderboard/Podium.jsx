import { Crown } from 'lucide-react'
import { motion } from 'motion/react'
import AnimatedNumber from '@/components/ui/AnimatedNumber'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'
import { firstName } from '@/lib/format'
import Flame from './Flame'
import FloatingDelta from './FloatingDelta'
import LevelBadge from './LevelBadge'

const PLACES = {
  1: {
    block: 'h-32 sm:h-44 border-gold/50 from-gold/40 via-gold/12 to-transparent',
    numeral: 'from-[#fff3c4] via-gold to-[#b45309]',
    ring: 'ring-gold',
    rise: 0.25,
  },
  2: {
    block: 'h-24 sm:h-32 border-silver/50 from-silver/40 via-silver/12 to-transparent',
    numeral: 'from-white via-silver to-[#64748b]',
    ring: 'ring-silver',
    rise: 0.1,
  },
  3: {
    block: 'h-20 sm:h-24 border-bronze/50 from-bronze/40 via-bronze/12 to-transparent',
    numeral: 'from-[#ffe1c2] via-bronze to-[#7c2d12]',
    ring: 'ring-bronze',
    rise: 0.4,
  },
}

function PodiumSpot({ row, place, isMe, delta, onSelect }) {
  const style = PLACES[place]
  const first = place === 1

  return (
    <button
      type="button"
      onClick={() => onSelect(row.member.id)}
      className="group relative flex min-w-0 flex-col items-center text-center"
      aria-label={`${row.member.name}, rank ${row.rank}, ${row.points} points`}
    >
      <div className={cn('relative', first ? 'mb-3 mt-10' : 'mb-2.5 mt-5')}>
        {first && (
          <span className="absolute inset-x-0 -top-10 flex justify-center">
            <Crown
              className="size-9 animate-float text-gold drop-shadow-[0_4px_12px_rgba(251,191,36,0.6)]"
              fill="currentColor"
              aria-hidden="true"
            />
          </span>
        )}
        <Avatar
          name={row.member.name}
          color={row.member.avatarColor}
          size={first ? 'xl' : 'lg'}
          className={cn(
            'ring-4 ring-offset-4 ring-offset-surface transition duration-300 group-hover:scale-110',
            style.ring,
            first && 'animate-glow-gold'
          )}
        />
        {row.onFire && <Flame className="absolute -bottom-1 -right-2 text-2xl" />}
        <FloatingDelta delta={delta} className="-top-3 left-1/2 -translate-x-1/2" />
      </div>

      <p className="w-full truncate px-1 text-sm font-bold sm:text-base">
        {firstName(row.member.name)}
        {isMe && <span className="text-accent"> (you)</span>}
      </p>
      <p className="mt-0.5 font-display text-3xl font-black leading-none tabular sm:text-5xl">
        <AnimatedNumber value={row.points} />
        <span className="ml-1 font-sans text-[11px] font-semibold text-muted">pts</span>
      </p>
      <LevelBadge level={row.level} className="mt-2" />

      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: style.rise, type: 'spring', stiffness: 120, damping: 16 }}
        style={{ originY: 1 }}
        className={cn(
          'relative mt-3 flex w-full justify-center overflow-hidden rounded-t-2xl border border-b-0 bg-gradient-to-b pt-2 sm:pt-3',
          style.block
        )}
      >
        <span aria-hidden="true" className="shine pointer-events-none absolute inset-0 opacity-50" />
        <span
          className={cn(
            'relative bg-gradient-to-b bg-clip-text font-display text-6xl font-black leading-none text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)] sm:text-8xl',
            style.numeral
          )}
        >
          {row.rank}
        </span>
      </motion.div>
    </button>
  )
}

/** Top three: #2 left, #1 centre (tallest, crowned, glowing), #3 right. */
export default function Podium({ rows, meId, deltas = {}, onSelect }) {
  const [first, second, third] = rows
  const slots = [
    { row: second, place: 2 },
    { row: first, place: 1 },
    { row: third, place: 3 },
  ]

  return (
    <section aria-label="Top three" className="card relative overflow-hidden px-3 pt-6 sm:px-10">
      {/* Stadium lighting */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-full w-[40rem] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--gold)_24%,transparent),transparent_65%)]" />
        <div className="absolute -left-16 -top-10 h-[150%] w-44 rotate-[28deg] bg-gradient-to-b from-accent/20 to-transparent blur-2xl" />
        <div className="absolute -right-16 -top-10 h-[150%] w-44 -rotate-[28deg] bg-gradient-to-b from-accent/20 to-transparent blur-2xl" />
      </div>

      <div className="relative mx-auto grid max-w-3xl grid-cols-3 items-end gap-2 sm:gap-6">
        {slots.map(({ row, place }) =>
          row ? (
            <PodiumSpot
              key={row.member.id}
              row={row}
              place={place}
              isMe={row.member.id === meId}
              delta={deltas[row.member.id]}
              onSelect={onSelect}
            />
          ) : (
            <div key={place} />
          )
        )}
      </div>
    </section>
  )
}
