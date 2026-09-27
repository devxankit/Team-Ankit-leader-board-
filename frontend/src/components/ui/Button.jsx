import { Link } from 'react-router-dom'
import { motionComponent } from '@/components/motion/motionComponent'
import { cn } from '@/lib/cn'
import Icon from './Icon'

const VARIANTS = {
  primary:
    'bg-brand-500 text-white shadow-glow hover:bg-brand-600 focus-visible:outline-brand-500',
  dark: 'bg-ink-900 text-white hover:bg-ink-800',
  outline:
    'border border-ink-200 bg-white text-ink-800 hover:border-ink-300 hover:bg-ink-50',
  ghost: 'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
  light: 'bg-white text-ink-900 hover:bg-ink-100',
  onDark: 'border border-white/25 text-white hover:border-white/50 hover:bg-white/10',
}

const SIZES = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-base gap-2.5',
}

const MotionLink = motionComponent(Link)
const MotionA = motionComponent('a')
const MotionButton = motionComponent('button')

/**
 * Button / link with the hover + press micro-interactions from PRD B12.
 *
 * Renders a react-router <Link> when given `to`, an <a> when given `href`
 * (external hrefs get target/rel and a ↗ affordance automatically), and a
 * <button> otherwise.
 */
export default function Button({
  to,
  href,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  fullWidth = false,
  className,
  children,
  ...rest
}) {
  const isExternal = Boolean(href && /^https?:\/\//i.test(href))
  const resolvedIcon = icon ?? (isExternal ? 'arrowUpRight' : undefined)

  const classes = cn(
    'inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200',
    'disabled:pointer-events-none disabled:opacity-60',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth && 'w-full',
    className
  )

  // Scale-only hover/press — no layout thrash, and MotionConfig strips these
  // automatically for prefers-reduced-motion users.
  const interactions = {
    whileHover: { scale: 1.025 },
    whileTap: { scale: 0.975 },
    transition: { type: 'spring', stiffness: 400, damping: 28 },
  }

  const content = (
    <>
      {resolvedIcon && iconPosition === 'left' ? (
        <Icon name={resolvedIcon} size={size === 'lg' ? 19 : 17} />
      ) : null}
      <span>{children}</span>
      {resolvedIcon && iconPosition === 'right' ? (
        <Icon name={resolvedIcon} size={size === 'lg' ? 19 : 17} />
      ) : null}
    </>
  )

  if (to) {
    return (
      <MotionLink to={to} className={classes} {...interactions} {...rest}>
        {content}
      </MotionLink>
    )
  }

  if (href) {
    return (
      <MotionA
        href={href}
        className={classes}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        {...interactions}
        {...rest}
      >
        {content}
      </MotionA>
    )
  }

  return (
    <MotionButton className={classes} {...interactions} {...rest}>
      {content}
    </MotionButton>
  )
}
