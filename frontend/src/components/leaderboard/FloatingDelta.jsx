import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { formatPoints } from '@/lib/format'

/** A "+10" / "−5" that pops up and floats away when a live update changes someone's score. */
export default function FloatingDelta({ delta, className }) {
  return (
    <AnimatePresence>
      {delta && (
        <motion.span
          key={delta.id}
          aria-hidden="true"
          initial={{ opacity: 0, y: 8, scale: 0.7 }}
          animate={{ opacity: [0, 1, 1, 0], y: -38, scale: 1.1 }}
          transition={{ duration: 2.3, times: [0, 0.12, 0.7, 1], ease: 'easeOut' }}
          className={cn(
            'pointer-events-none absolute z-20 whitespace-nowrap rounded-lg px-2 py-0.5 font-display text-2xl font-black shadow-lg ring-1 backdrop-blur',
            delta.amount > 0 ? 'bg-reward-soft text-reward ring-reward/40' : 'bg-penalty-soft text-penalty ring-penalty/40',
            className
          )}
        >
          {formatPoints(delta.amount)}
        </motion.span>
      )}
    </AnimatePresence>
  )
}
