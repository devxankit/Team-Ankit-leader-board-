import { cn } from '@/lib/cn'
import { initials } from '@/lib/format'

const SIZES = {
  xs: 'size-7 text-[10px]',
  sm: 'size-9 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-16 text-lg',
  xl: 'size-20 text-2xl',
}

/** Initials on the member's colour. Decorative: the name is always shown next to it. */
export default function Avatar({ name, color, size = 'md', className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold tracking-wide text-white',
        SIZES[size],
        className
      )}
      style={{ backgroundColor: color || '#475569' }}
    >
      {initials(name)}
    </span>
  )
}
