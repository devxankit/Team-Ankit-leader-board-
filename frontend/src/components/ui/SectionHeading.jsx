import Reveal from '@/components/motion/Reveal'
import { cn } from '@/lib/cn'

/**
 * Eyebrow + heading + optional lede, reused across every section and About page
 * (PRD B8 `SectionIntro`).
 *
 * `as` defaults to h2 — pages render their single <h1> in the page hero, which
 * is how the legacy site's multiple-h1-per-page problem (PRD B7) stays fixed.
 */
export default function SectionHeading({
  as = 'h2',
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
  className,
  children,
}) {
  const Heading = as
  const centered = align === 'center'
  const dark = tone === 'dark'

  return (
    <Reveal
      className={cn(
        'flex flex-col gap-4',
        centered && 'items-center text-center',
        className
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            'inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.18em] uppercase',
            dark ? 'text-amber-brand-400' : 'text-brand-700'
          )}
        >
          <span
            aria-hidden="true"
            className={cn('h-px w-7', dark ? 'bg-amber-brand-400/60' : 'bg-brand-500/50')}
          />
          {eyebrow}
        </span>
      ) : null}

      <Heading className={cn('text-display-sm sm:text-display-md', dark && 'text-white')}>
        {title}
      </Heading>

      {description ? (
        <p
          className={cn(
            'max-w-2xl text-base leading-relaxed sm:text-lg',
            centered && 'mx-auto',
            dark ? 'text-white/70' : 'text-ink-500'
          )}
        >
          {description}
        </p>
      ) : null}

      {children}
    </Reveal>
  )
}
