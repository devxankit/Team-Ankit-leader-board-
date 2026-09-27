/**
 * Shared Framer Motion variants.
 *
 * Every animation in the site is built from these so timing and easing stay
 * consistent, and so all of them are transform/opacity-only — GPU-friendly and
 * never layout-triggering (PRD B12 / B7 performance).
 *
 * Reduced motion is handled globally by <MotionConfig reducedMotion="user"> in
 * App.jsx, which strips transform animations while keeping opacity fades, plus
 * the CSS killswitch in index.css. Components that own a *continuous* effect
 * (hero Ken Burns, parallax) additionally check useReducedMotion() and skip it
 * entirely.
 */

/** Expo-style ease-out — quick start, long settle. The house easing curve. */
export const EASE_OUT = [0.22, 1, 0.36, 1]
/** Symmetric ease for things that move both ways (menus, drawers). */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1]

/** Fade up — the default scroll-reveal. */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

/** Straight fade, for things that shouldn't shift position. */
export const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } },
}

export const fadeLeft = {
  hidden: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

export const fadeRight = {
  hidden: { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

/** Cards entering a grid — a touch of scale reads as "lifting in". */
export const riseIn = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
}

export const REVEAL_VARIANTS = {
  up: fadeUp,
  fade,
  left: fadeLeft,
  right: fadeRight,
  rise: riseIn,
}

/**
 * Container that sequences its children. Pair with `staggerItem` (or any of the
 * variants above) on each child.
 */
export function staggerContainer(stagger = 0.08, delayChildren = 0) {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  }
}

/** Default child variant for a stagger container. */
export const staggerItem = fadeUp

/** Hero headline: each line clips up from below. */
export const heroLine = {
  hidden: { opacity: 0, y: '110%' },
  visible: { opacity: 1, y: '0%', transition: { duration: 0.85, ease: EASE_OUT } },
}

/** Route-level transition used by AnimatePresence. */
export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.22, ease: 'easeIn' } },
}

/** Dropdown / mega-menu panel. */
export const menuPanel = {
  hidden: { opacity: 0, y: -8, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.99,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
}

/** Standard viewport config for scroll-reveals: fire once, slightly early. */
export const VIEWPORT = { once: true, amount: 0.2, margin: '0px 0px -80px 0px' }

/**
 * Returns a copy of `variant` with `delay` baked into its visible transition.
 *
 * A `transition` prop on a motion component is *overridden* by a transition
 * defined inside a variant, so delaying a variant-driven animation has to be
 * done by rewriting the variant rather than by passing transition={{ delay }}.
 *
 * @param {Object} variant
 * @param {number} delay - seconds; 0 returns the variant untouched
 */
export function withDelay(variant, delay) {
  if (!delay) return variant

  return {
    ...variant,
    visible: {
      ...variant.visible,
      transition: { ...variant.visible?.transition, delay },
    },
  }
}
