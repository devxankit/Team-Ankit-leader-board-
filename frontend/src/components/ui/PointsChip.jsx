import { cn } from '@/lib/cn'
import { formatPoints } from '@/lib/format'

/** Green for rewards, red for penalties. */
export default function PointsChip({ points, size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg font-bold tabular',
        size === 'sm' ? 'min-w-11 px-1.5 py-0.5 text-xs' : 'min-w-12 px-2 py-1 text-sm',
        points > 0 ? 'bg-reward-soft text-reward' : 'bg-penalty-soft text-penalty',
        className
      )}
    >
      {formatPoints(points)}
    </span>
  )
}
