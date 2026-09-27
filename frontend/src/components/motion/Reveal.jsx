import { useMemo } from 'react'
import { motionComponent } from './motionComponent'
import { REVEAL_VARIANTS, VIEWPORT, withDelay } from './variants'

/**
 * Scroll-reveal wrapper (PRD B12). Fades/slides its children into view once,
 * the first time they scroll into the viewport.
 *
 * @param {Object} props
 * @param {React.ElementType} [props.as='div']    - element to render
 * @param {'up'|'fade'|'left'|'right'|'rise'} [props.variant='up']
 * @param {number} [props.delay=0]                - seconds
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Reveal({
  as = 'div',
  variant = 'up',
  delay = 0,
  className,
  children,
  ...rest
}) {
  const Component = motionComponent(as)
  const variants = useMemo(
    () => withDelay(REVEAL_VARIANTS[variant] ?? REVEAL_VARIANTS.up, delay),
    [variant, delay]
  )

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={variants}
      {...rest}
    >
      {children}
    </Component>
  )
}
