import { motionComponent } from './motionComponent'
import { REVEAL_VARIANTS } from './variants'

/**
 * A single child of <StaggerGroup>. Inherits the parent's animation state, so
 * it needs no viewport config of its own.
 */
export default function StaggerItem({
  as = 'div',
  variant = 'up',
  className,
  children,
  ...rest
}) {
  const Component = motionComponent(as)

  return (
    <Component
      className={className}
      variants={REVEAL_VARIANTS[variant] ?? REVEAL_VARIANTS.up}
      {...rest}
    >
      {children}
    </Component>
  )
}
