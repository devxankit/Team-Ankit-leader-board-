import Reveal from '@/components/motion/Reveal'
import { cn } from '@/lib/cn'

/**
 * Body-copy renderer for the migrated legacy text.
 *
 * Each paragraph reveals on scroll in sequence, giving the long-form About and
 * division pages the section transitions from PRD B12 without needing a wrapper
 * per paragraph at the call site.
 *
 * @param {string[]} props.paragraphs
 */
export default function Prose({ paragraphs = [], size = 'base', className }) {
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {paragraphs.map((paragraph, index) => (
        <Reveal
          as="p"
          key={paragraph.slice(0, 48)}
          delay={Math.min(index * 0.06, 0.3)}
          className={cn(
            'leading-relaxed text-ink-600 text-justify',
            size === 'lg' ? 'text-lg' : 'text-base'
          )}
        >
          {paragraph}
        </Reveal>
      ))}
    </div>
  )
}
