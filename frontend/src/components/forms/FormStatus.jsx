import { AnimatePresence, motion } from 'motion/react'
import Icon from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/**
 * Form-level success / error banner.
 *
 * The legacy PHP forms did this with a full page reload and a session flash;
 * here it animates in place. role="status" means assistive tech announces the
 * outcome without the focus ever moving.
 *
 * @param {'idle'|'success'|'error'} props.state
 */
export default function FormStatus({ state, message, className }) {
  const visible = state === 'success' || state === 'error'
  const isSuccess = state === 'success'

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, height: 0, y: -6 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className={cn('overflow-hidden', className)}
        >
          <div
            className={cn(
              'flex items-start gap-3 rounded-2xl border p-4',
              isSuccess
                ? 'border-success/25 bg-success-soft text-success'
                : 'border-danger/25 bg-danger-soft text-danger'
            )}
          >
            <Icon name={isSuccess ? 'check' : 'alert'} size={18} className="mt-0.5" />
            <p className="text-sm leading-relaxed font-medium">{message}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
