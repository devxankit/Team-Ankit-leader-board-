import Icon from './Icon'
import Reveal from '@/components/motion/Reveal'
import { cn } from '@/lib/cn'

/**
 * In-page notice marking a section whose real copy has not been written yet.
 *
 * Ten pages are in this state (PRD B10). Making it loud and consistent means
 * placeholder text can never be mistaken for approved copy, and every remaining
 * gap is findable by searching for this component.
 */
export default function ContentPendingNotice({
  title = 'This page is awaiting its final content',
  message = 'The copy below is placeholder text, not approved wording. It will be replaced once the division supplies its final content.',
  className,
}) {
  return (
    <Reveal
      className={cn(
        'flex gap-4 rounded-2xl border border-dashed border-amber-brand-300 bg-amber-brand-50 p-5 sm:p-6',
        className
      )}
    >
      <Icon name="alert" size={20} className="mt-0.5 shrink-0 text-amber-brand-700" />
      <div>
        <p className="font-display text-sm font-semibold text-amber-brand-900">{title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-amber-brand-800/90">
          {message}
        </p>
      </div>
    </Reveal>
  )
}
