import { motion } from 'motion/react'

/**
 * Cached motion.create() lookups.
 *
 * motion.create() must never be called during render — it returns a brand new
 * component type each time, which remounts the entire subtree on every render
 * and throws away animation state. Caching by element type keeps the reference
 * stable for the life of the module.
 */
const cache = new Map()

/**
 * @param {React.ElementType} as
 * @returns {React.ElementType} the motion-enabled version of `as`
 */
export function motionComponent(as) {
  const cached = cache.get(as)
  if (cached) return cached

  const created = motion.create(as)
  cache.set(as, created)
  return created
}
