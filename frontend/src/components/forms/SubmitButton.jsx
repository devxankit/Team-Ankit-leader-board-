import { AnimatePresence, motion } from 'motion/react'
import Icon from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/**
 * Submit button that animates through idle → submitting → success/error
 * (PRD B12), replacing the legacy pattern of swapping a static banner after a
 * full page reload.
 *
 * @param {'idle'|'submitting'|'success'|'error'} props.state
 */
export default function SubmitButton({
  state = 'idle',
  idleLabel = 'Send message',
  submittingLabel = 'Sending…',
  successLabel = 'Sent',
  errorLabel = 'Try again',
  fullWidth = false,
  className,
  ...rest
}) {
  const isBusy = state === 'submitting'

  const content = {
    idle: { label: idleLabel, icon: 'arrowRight' },
    submitting: { label: submittingLabel, icon: 'spinner' },
    success: { label: successLabel, icon: 'check' },
    error: { label: errorLabel, icon: 'alert' },
  }[state]

  return (
    <motion.button
      type="submit"
      disabled={isBusy}
      aria-busy={isBusy}
      whileHover={isBusy ? undefined : { scale: 1.02 }}
      whileTap={isBusy ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'relative inline-flex h-13 items-center justify-center gap-2.5 overflow-hidden rounded-full px-8 text-base font-medium text-white transition-colors duration-300',
        'disabled:cursor-wait',
        state === 'success'
          ? 'bg-success'
          : state === 'error'
            ? 'bg-danger'
            : 'bg-brand-500 shadow-glow hover:bg-brand-600',
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-2.5"
        >
          <span>{content.label}</span>
          <Icon
            name={content.icon}
            size={18}
            className={isBusy ? 'animate-spin' : undefined}
          />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
