import { cn } from '@/lib/cn'

/** Pill-style single choice (period tabs, reward/penalty, filters). */
export default function SegmentedControl({ label, options, value, onChange, size = 'md', className }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex rounded-xl border border-line bg-subtle p-1', className)}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-lg font-semibold transition',
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3.5 text-sm',
              active ? cn('bg-surface shadow-sm', option.activeClass ?? 'text-ink') : 'text-muted hover:text-ink'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
