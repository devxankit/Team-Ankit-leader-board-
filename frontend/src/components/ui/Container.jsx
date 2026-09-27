import { cn } from '@/lib/cn'

const WIDTHS = {
  narrow: 'max-w-3xl',
  prose: 'max-w-4xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
}

/**
 * Page gutter + max-width wrapper. Replaces the legacy float-grid `hoc`/
 * `container` classes with a single fluid, responsive container.
 *
 * @param {'narrow'|'prose'|'default'|'wide'} [props.width='default']
 */
export default function Container({
  as: Component = 'div',
  width = 'default',
  className,
  children,
  ...rest
}) {
  return (
    <Component
      className={cn('mx-auto w-full px-5 sm:px-6 lg:px-8', WIDTHS[width], className)}
      {...rest}
    >
      {children}
    </Component>
  )
}
