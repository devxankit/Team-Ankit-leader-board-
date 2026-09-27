import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Icon from '@/components/ui/Icon'
import { useScrolled } from '@/hooks/useScrolled'

/**
 * Floating back-to-top control.
 *
 * Animates in and out with scroll position rather than hard-toggling the way
 * the legacy jQuery plugin did (PRD B12).
 */
export default function BackToTop() {
  const visible = useScrolled(500)
  const prefersReducedMotion = useReducedMotion()

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 12 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="fixed right-5 bottom-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-glow transition-colors hover:bg-brand-600 sm:right-8 sm:bottom-8"
        >
          <Icon name="chevronUp" size={22} />
        </motion.button>
      ) : null}
    </AnimatePresence>
  )
}
