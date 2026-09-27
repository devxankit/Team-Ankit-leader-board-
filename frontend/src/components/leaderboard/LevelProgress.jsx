import { cn } from '@/lib/cn'
import { formatTotal } from '@/lib/format'
import { levelStyle } from '@/lib/levels'

/** Bar towards the next level, with "X pts to Gold". Levels use all-time points. */
export default function LevelProgress({ level, className }) {
  const style = levelStyle(level.key)
  const percent = Math.round(level.progress * 100)
  const label = level.next ? `${formatTotal(level.pointsToNext)} pts to ${level.next.name}` : 'Top level reached'

  return (
    <div className={className}>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-subtle"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={label}
      >
        <div
          className={cn('relative h-full overflow-hidden rounded-full transition-[width] duration-1000 ease-out', style.bar)}
          style={{ width: `${level.next ? Math.max(4, percent) : 100}%` }}
        >
          <span aria-hidden="true" className="shine absolute inset-0" />
        </div>
      </div>
      <p className="mt-1 truncate text-[11px] font-medium text-muted">{label}</p>
    </div>
  )
}
