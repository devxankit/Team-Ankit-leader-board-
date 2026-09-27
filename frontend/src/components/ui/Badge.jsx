import { cn } from '@/lib/cn'

const VARIANTS = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  pending: 'bg-amber-brand-50 text-amber-brand-800 ring-amber-brand-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  onDark: 'bg-white/10 text-white/80 ring-white/20',
}

/**
 * Small status pill. Used for the cluster eyebrow on cards and, importantly,
 * for the "Content pending" marker on the nine divisions still awaiting real
 * copy (PRD B5/B10) so placeholder pages are never mistaken for finished ones.
 */
export default function Badge({ variant = 'neutral', className, children, ...rest }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        VARIANTS[variant] ?? VARIANTS.neutral,
        className
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
