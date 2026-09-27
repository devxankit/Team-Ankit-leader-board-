import { cn } from '@/lib/cn'
import { levelStyle } from '@/lib/levels'

export default function LevelBadge({ level, size = 'sm', className }) {
  const style = levelStyle(level.key)
  const Icon = style.icon
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full font-bold uppercase tracking-wide ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        style.chip,
        className
      )}
    >
      <Icon className={size === 'sm' ? 'size-3' : 'size-3.5'} strokeWidth={2.5} aria-hidden="true" />
      {level.name}
    </span>
  )
}
