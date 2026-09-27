import { cn } from '@/lib/cn'

const TONES = {
  green: 'bg-reward-soft text-reward',
  red: 'bg-penalty-soft text-penalty',
  gray: 'bg-subtle text-muted',
  violet: 'bg-accent/12 text-accent',
}

export default function StatusBadge({ tone = 'gray', children }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium', TONES[tone])}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
