import { AnimatePresence, motion } from 'motion/react'
import { useId } from 'react'
import Icon from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/**
 * Floating-label text input / textarea (PRD B12 micro-interactions).
 *
 * The label sits inside the field and lifts to the top edge on focus or once
 * the field has content, driven by the `peer` + `placeholder-shown` pattern —
 * CSS transitions only, so it costs nothing at runtime and needs no JS state.
 *
 * Validation messages animate in beneath the field and are wired with
 * aria-invalid + aria-describedby so screen readers announce them.
 *
 * React 19 passes `ref` as an ordinary prop, so React Hook Form's register()
 * spread works directly with no forwardRef wrapper.
 */
export default function FloatingField({
  label,
  as = 'input',
  type = 'text',
  error,
  hint,
  rows = 5,
  className,
  ref,
  ...field
}) {
  const generatedId = useId()
  const id = field.id ?? `${field.name ?? 'field'}-${generatedId}`
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const isTextarea = as === 'textarea'

  const controlClasses = cn(
    'peer w-full rounded-2xl border bg-white px-4 text-base text-ink-900 transition-all duration-200',
    'placeholder:text-transparent',
    'focus:outline-none focus:ring-4',
    isTextarea ? 'resize-y pt-7 pb-3' : 'h-14 pt-6 pb-1.5',
    error
      ? 'border-danger focus:border-danger focus:ring-danger/15'
      : 'border-ink-200 hover:border-ink-300 focus:border-brand-500 focus:ring-brand-500/12'
  )

  const labelClasses = cn(
    'pointer-events-none absolute left-4 origin-left text-ink-400 transition-all duration-200',
    // Resting state (field empty, not focused): centred in the control.
    isTextarea
      ? 'top-5 text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-base'
      : 'top-4 text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-base',
    // Lifted state: focused, or holding a value.
    'peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium',
    'peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-medium',
    error ? 'peer-focus:text-danger' : 'peer-focus:text-brand-700'
  )

  const Control = isTextarea ? 'textarea' : 'input'

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="relative">
        <Control
          {...field}
          ref={ref}
          id={id}
          type={isTextarea ? undefined : type}
          rows={isTextarea ? rows : undefined}
          // A non-empty placeholder is required for :placeholder-shown to flip
          // as the user types — a single space is the standard trick.
          placeholder=" "
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={cn(error && errorId, hint && hintId) || undefined}
          className={controlClasses}
        />
        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>
      </div>

      {hint && !error ? (
        <p id={hintId} className="mt-1.5 px-1 text-xs text-ink-400">
          {hint}
        </p>
      ) : null}

      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-1 text-xs text-danger"
          >
            <span className="mt-1.5 flex items-center gap-1.5">
              <Icon name="alert" size={13} />
              {error}
            </span>
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
