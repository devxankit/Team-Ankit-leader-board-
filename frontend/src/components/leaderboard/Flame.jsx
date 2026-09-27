import { cn } from '@/lib/cn'

/** Animated 🔥 for members on fire. */
export default function Flame({ className }) {
  return (
    <span
      role="img"
      aria-label="On fire"
      title="On fire: 3+ rewards and no penalties in the last 7 days"
      className={cn('inline-block origin-bottom animate-flicker', className)}
    >
      🔥
    </span>
  )
}
