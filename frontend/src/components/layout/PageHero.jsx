import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import Container from '@/components/ui/Container'
import Icon from '@/components/ui/Icon'
import PlaceholderImage from '@/components/ui/PlaceholderImage'
import { EASE_OUT, staggerContainer } from '@/components/motion/variants'
import { cn } from '@/lib/cn'

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

/**
 * The hero band for every inner page.
 *
 * Renders the page's single <h1> in one place, which is how the "multiple h1s
 * per page" problem from PRD B7 stays fixed: sections below use SectionHeading,
 * which defaults to h2.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.eyebrow]
 * @param {string} [props.description]
 * @param {Array<{label: string, to?: string}>} [props.breadcrumbs]
 * @param {{alt: string, label: string, src?: string|null, status?: string}} [props.image]
 *        when provided the hero uses a placeholder photo backdrop instead of the
 *        plain gradient
 * @param {React.ReactNode} [props.badge]   - e.g. a "Content pending" badge
 * @param {React.ReactNode} [props.actions] - buttons rendered under the lede
 */
export default function PageHero({
  title,
  eyebrow,
  description,
  breadcrumbs = [],
  image,
  badge,
  actions,
}) {
  return (
    <section
      className={cn('relative overflow-hidden bg-ink-950', image ? 'min-h-[26rem]' : '')}
    >
      {image ? (
        <>
          <div className="absolute inset-0">
            <PlaceholderImage
              alt={image.alt}
              label={image.label}
              src={image.src}
              status={image.status ?? 'placeholder'}
              tone="dark"
              aspect="h-full"
              priority
              className="h-full w-full"
            />
          </div>
          <div aria-hidden="true" className="hero-scrim absolute inset-0" />
        </>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-20 h-96 w-96 rounded-full bg-brand-500/18 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-amber-brand-500/10 blur-3xl"
          />
        </>
      )}

      <Container
        width="wide"
        className={cn(
          'relative',
          image ? 'flex min-h-[26rem] items-end py-16' : 'py-16 sm:py-20'
        )}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer(0.09)}
          className="max-w-3xl"
        >
          {breadcrumbs.length ? (
            <motion.nav variants={item} aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/50">
                {breadcrumbs.map((crumb, index) => (
                  <li key={crumb.label} className="flex items-center gap-1.5">
                    {index > 0 ? (
                      <Icon name="chevronRight" size={13} className="text-white/30" />
                    ) : null}
                    {crumb.to ? (
                      <Link
                        to={crumb.to}
                        className="transition-colors hover:text-amber-brand-400"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-white/75">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </motion.nav>
          ) : null}

          {eyebrow ? (
            <motion.span
              variants={item}
              className="mb-4 inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.18em] text-amber-brand-400 uppercase"
            >
              <span aria-hidden="true" className="h-px w-7 bg-amber-brand-400/60" />
              {eyebrow}
            </motion.span>
          ) : null}

          <motion.h1
            variants={item}
            className="text-display-sm text-white sm:text-display-md"
          >
            {title}
          </motion.h1>

          {badge ? (
            <motion.div variants={item} className="mt-5">
              {badge}
            </motion.div>
          ) : null}

          {description ? (
            <motion.p
              variants={item}
              className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg"
            >
              {description}
            </motion.p>
          ) : null}

          {actions ? (
            <motion.div
              variants={item}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              {actions}
            </motion.div>
          ) : null}
        </motion.div>
      </Container>
    </section>
  )
}
