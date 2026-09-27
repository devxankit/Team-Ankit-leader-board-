import { useId } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Icon from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/**
 * Resume upload control for the Career form.
 *
 * A styled label wrapping a visually-hidden file input — the input stays a real
 * <input type="file"> so keyboard and screen-reader behaviour is native, while
 * the visible surface can be designed and animated.
 *
 * @param {FileList|undefined} props.value - the current FileList, for the filename preview
 */
export default function FileField({
  label,
  hint,
  error,
  accept,
  value,
  className,
  ref,
  ...field
}) {
  const generatedId = useId()
  const id = field.id ?? `${field.name ?? 'file'}-${generatedId}`
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const file = value?.[0]

  return (
    <div className={cn('flex flex-col', className)}>
      <span className="mb-2 px-1 text-xs font-medium text-ink-500">{label}</span>

      <label
        htmlFor={id}
        className={cn(
          'group flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed bg-white px-5 py-5 transition-all duration-200',
          'focus-within:ring-4',
          error
            ? 'border-danger focus-within:border-danger focus-within:ring-danger/15'
            : 'border-ink-300 hover:border-brand-400 hover:bg-brand-50/40 focus-within:border-brand-500 focus-within:ring-brand-500/12'
        )}
      >
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
            file
              ? 'bg-success/10 text-success'
              : 'bg-ink-100 text-ink-500 group-hover:bg-brand-100 group-hover:text-brand-600'
          )}
        >
          <Icon name={file ? 'file' : 'upload'} size={20} />
        </span>

        <span className="min-w-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={file?.name ?? 'empty'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="block"
            >
              <span className="block truncate text-sm font-medium text-ink-900">
                {file ? file.name : 'Choose a file or drag it here'}
              </span>
              <span className="mt-0.5 block text-xs text-ink-400">
                {file ? `${(file.size / 1024).toFixed(0)} KB — click to replace` : hint}
              </span>
            </motion.span>
          </AnimatePresence>
        </span>

        <input
          {...field}
          ref={ref}
          id={id}
          type="file"
          accept={accept}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={cn(error && errorId, hint && hintId) || undefined}
          className="sr-only"
        />
      </label>

      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
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
