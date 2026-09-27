import { motion } from 'motion/react'
import { pageTransition } from './variants'

/**
 * Wraps a route's content so navigating between pages cross-fades instead of
 * hard-cutting (PRD B12 page transitions). Driven by <AnimatePresence> in
 * AppRoutes.jsx, which keys on the pathname.
 */
export default function PageTransition({ children, className }) {
  return (
    <motion.div
      className={className}
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
    >
      {children}
    </motion.div>
  )
}
