import { Check } from 'lucide-react'
import Dialog from '@/components/ui/Dialog'
import { OUTCOMES } from '@/config/outcomes'
import { cn } from '@/lib/cn'

const TONES = {
  gold: { card: 'border-gold/40 bg-gold/8', zone: 'bg-gold/15 text-gold', check: 'text-gold' },
  accent: { card: 'border-accent/30 bg-accent/6', zone: 'bg-accent/15 text-accent', check: 'text-accent' },
  penalty: { card: 'border-penalty/30 bg-penalty-soft/40', zone: 'bg-penalty-soft text-penalty', check: 'text-penalty' },
}

/** Explains what finishing in the top 3, the middle or the bottom 3 leads to. */
export default function OutcomesSheet({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      variant="drawer"
      title="What's at stake"
      description="Where you finish on the leaderboard shapes what comes next."
    >
      <ol className="space-y-3">
        {OUTCOMES.map((outcome) => {
          const tone = TONES[outcome.tone]
          return (
            <li key={outcome.key} className={cn('rounded-2xl border p-4', tone.card)}>
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface text-2xl" aria-hidden="true">
                  {outcome.emoji}
                </span>
                <div className="min-w-0">
                  <span className={cn('rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide', tone.zone)}>
                    {outcome.zone}
                  </span>
                  <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-none tracking-wide">
                    {outcome.title}
                  </p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {outcome.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm">
                    <Check className={cn('mt-0.5 size-4 shrink-0', tone.check)} strokeWidth={3} />
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>
      <p className="mt-4 text-xs text-muted">
        Points come from rewards and penalties given by the admin. Watch the latest activity to see what earns them.
      </p>
    </Dialog>
  )
}
