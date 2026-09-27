import { useId } from 'react'
import { cn } from '@/lib/cn'

const control = (error) =>
  cn(
    'w-full rounded-xl border bg-surface px-3 text-sm text-ink transition placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/35',
    error ? 'border-penalty' : 'border-line focus:border-accent'
  )

/** Label + control + error/hint. `children` is called with the generated input id. */
export function Field({ label, error, hint, className, children }) {
  const id = useId()
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
        </label>
      )}
      {children(id)}
      {error ? (
        <p className="text-xs font-medium text-penalty">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextInput({ error, className, ...props }) {
  return <input aria-invalid={Boolean(error)} className={cn(control(error), 'h-10', className)} {...props} />
}

export function SelectInput({ error, className, children, ...props }) {
  return (
    <select aria-invalid={Boolean(error)} className={cn(control(error), 'h-10 pr-8', className)} {...props}>
      {children}
    </select>
  )
}

export function TextArea({ error, className, ...props }) {
  return <textarea aria-invalid={Boolean(error)} className={cn(control(error), 'min-h-20 py-2.5', className)} {...props} />
}
