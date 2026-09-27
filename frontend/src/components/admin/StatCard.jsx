import { cn } from '@/lib/cn'

const TONES = {
  default: 'bg-accent/12 text-accent',
  reward: 'bg-reward-soft text-reward',
  penalty: 'bg-penalty-soft text-penalty',
  gold: 'bg-gold/15 text-gold',
}

export default function StatCard({ label, value, hint, icon: Icon, tone = 'default' }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {Icon && (
          <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', TONES[tone])}>
            <Icon className="size-[18px]" />
          </span>
        )}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}
