import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import Icon from './Icon'

/**
 * The image slot for the entire site.
 *
 * Every image on the new build starts as a clearly-labelled placeholder — no
 * legacy photography is carried over. Real artwork is supplied per business
 * unit later, and swapping it in is a two-field change on the data object:
 *
 *     heroImage: '/images/agriculture-hero.jpg',   // was null
 *     imageStatus: 'final',                        // was 'placeholder'
 *
 * No component or layout changes are needed — this renders the labelled panel
 * while `status` is 'placeholder' and a real responsive <img> once it is
 * 'final'. `alt` doubles as the description of what the final photo should
 * show, so the placeholder stays meaningful rather than generic (PRD B4).
 *
 * @param {Object} props
 * @param {string|null} [props.src]          - heroImage; null while placeholder
 * @param {string} props.alt                 - heroImageAlt: describes the intended photo
 * @param {'placeholder'|'final'} [props.status='placeholder']
 * @param {string} [props.label]             - big text on the panel, e.g. the division name
 * @param {string} [props.aspect='aspect-[4/3]']
 * @param {boolean} [props.kenBurns=false]   - slow drift, hero only; skipped for reduced motion
 * @param {boolean} [props.priority=false]   - eager-load above-the-fold images
 * @param {'light'|'dark'} [props.tone='light']
 */
export default function PlaceholderImage({
  src = null,
  alt,
  status = 'placeholder',
  label,
  aspect = 'aspect-[4/3]',
  kenBurns = false,
  priority = false,
  tone = 'light',
  className,
  imgClassName,
}) {
  const prefersReducedMotion = useReducedMotion()
  const isFinal = status === 'final' && Boolean(src)
  const animate = kenBurns && !prefersReducedMotion

  if (isFinal) {
    return (
      <div className={cn('relative overflow-hidden', aspect, className)}>
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          className={cn(
            'h-full w-full object-cover',
            animate && 'animate-ken-burns will-change-transform',
            imgClassName
          )}
        />
      </div>
    )
  }

  const dark = tone === 'dark'

  return (
    <div
      // Exposed as an image with the intended description, so assistive tech
      // hears what the slot is for rather than nothing at all.
      role="img"
      aria-label={`Placeholder image. ${alt}. Final photography pending.`}
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        aspect,
        dark ? 'bg-ink-900' : 'bg-ink-100',
        className
      )}
    >
      {/* Diagonal hatch — reads unmistakably as "not a real photo". */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(135deg, ${
            dark ? 'rgba(255,255,255,.05)' : 'rgba(71,71,71,.06)'
          } 0px, ${
            dark ? 'rgba(255,255,255,.05)' : 'rgba(71,71,71,.06)'
          } 1px, transparent 1px, transparent 11px)`,
        }}
      />
      {/* Faint brand wash so placeholders still feel like part of the design. */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 bg-gradient-to-br',
          dark
            ? 'from-brand-500/15 via-transparent to-amber-brand-500/10'
            : 'from-brand-500/8 via-transparent to-amber-brand-500/8'
        )}
      />

      <div className="relative flex max-w-[85%] flex-col items-center gap-2.5 px-4 py-6 text-center">
        <Icon
          name="image"
          size={26}
          className={dark ? 'text-white/40' : 'text-ink-400'}
        />
        {label ? (
          <p
            className={cn(
              'font-display text-sm font-semibold tracking-tight sm:text-base',
              dark ? 'text-white/85' : 'text-ink-700'
            )}
          >
            {label}
          </p>
        ) : null}
        <p
          className={cn(
            'text-xs leading-relaxed',
            dark ? 'text-white/50' : 'text-ink-500'
          )}
        >
          {alt}
        </p>
        <span
          className={cn(
            'mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ring-1 ring-inset',
            dark
              ? 'bg-white/10 text-white/60 ring-white/15'
              : 'bg-white text-ink-500 ring-ink-200'
          )}
        >
          Image pending
        </span>
      </div>
    </div>
  )
}
