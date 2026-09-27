import { useMemo } from 'react'
import { motionComponent } from './motionComponent'
import { staggerContainer, VIEWPORT } from './variants'

/**
 * Reveals its children in sequence rather than all at once — used for the
 * homepage business-unit grid, value props and list content (PRD B12).
 *
 * Children should be <StaggerItem> (or any motion element carrying the same
 * hidden/visible variant names).
 */
export default function StaggerGroup({
  as = 'div',
  stagger = 0.08,
  delayChildren = 0,
  className,
  children,
  ...rest
}) {
  const Component = motionComponent(as)
  const variants = useMemo(
    () => staggerContainer(stagger, delayChildren),
    [stagger, delayChildren]
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
