import { motion } from 'motion/react'
import Avatar from '@/components/ui/Avatar'
import { computeAwards } from '@/lib/awards'
import { cn } from '@/lib/cn'

const TONES = {
  gold: { icon: 'bg-gold/15', text: 'text-gold', glow: 'bg-gold', edge: 'from-gold/70' },
  reward: { icon: 'bg-reward-soft', text: 'text-reward', glow: 'bg-reward', edge: 'from-reward/70' },
  accent: { icon: 'bg-accent/15', text: 'text-accent', glow: 'bg-accent', edge: 'from-accent/70' },
  sky: { icon: 'bg-sky-500/15', text: 'text-sky-600 dark:text-sky-300', glow: 'bg-sky-400', edge: 'from-sky-400/70' },
  bronze: { icon: 'bg-bronze/15', text: 'text-bronze', glow: 'bg-bronze', edge: 'from-bronze/70' },
  fuchsia: { icon: 'bg-fuchsia-500/15', text: 'text-fuchsia-600 dark:text-fuchsia-300', glow: 'bg-fuchsia-500', edge: 'from-fuchsia-500/70' },
}

function AwardCard({ award, index, onSelect }) {
  const tone = TONES[award.tone]
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(award.row.member.id)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, type: 'spring', stiffness: 260, damping: 24 }}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface p-4 text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent', tone.edge)} />
      <span
        aria-hidden="true"
        className={cn('pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-25 blur-2xl transition duration-500 group-hover:opacity-50', tone.glow)}
      />
      <span className={cn('grid size-12 place-items-center rounded-2xl text-2xl transition duration-300 group-hover:scale-110 group-hover:rotate-6', tone.icon)}>
        {award.emoji}
      </span>
      <p className={cn('mt-3 text-[11px] font-extrabold uppercase tracking-[0.16em]', tone.text)}>{award.title}</p>
      <div className="mt-1.5 flex min-w-0 items-center gap-2">
        <Avatar name={award.row.member.name} color={award.row.member.avatarColor} size="xs" />
        <span className="truncate font-semibold">{award.row.member.name}</span>
      </div>
      <p className="mt-2 font-display text-xl font-extrabold leading-tight tracking-wide">{award.stat}</p>
    </motion.button>
  )
}

/** Live awards for the selected period — they move as soon as the scores do. */
export default function Awards({ rows, periodLabel, onSelect }) {
  const awards = computeAwards(rows)
  if (!awards.length) return null

  return (
    <section aria-label="Awards">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide">🏅 Awards</h2>
        <span className="text-xs font-medium text-muted">{periodLabel} · updates live</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
        {awards.map((award, index) => (
          <AwardCard key={award.key} award={award} index={index} onSelect={onSelect} />
        ))}
      </div>
    </section>
  )
}
