import { useEffect } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { formatTotal } from '@/lib/format'

/** Counts up to `value` on first render and glides to every new value after a live update. */
export default function AnimatedNumber({ value, format = formatTotal, className }) {
  const reduceMotion = useReducedMotion()
  const count = useMotionValue(reduceMotion ? value : 0)
  const text = useTransform(count, (latest) => format(Math.round(latest)))

  useEffect(() => {
    if (reduceMotion) {
      count.set(value)
      return undefined
    }
    const controls = animate(count, value, { duration: 1.1, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [count, value, reduceMotion])

  return <motion.span className={className}>{text}</motion.span>
}
