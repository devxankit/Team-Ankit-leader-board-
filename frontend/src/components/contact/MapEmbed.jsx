import Icon from '@/components/ui/Icon'
import { siteConfig } from '@/config/site'

/**
 * Google Maps embed for the contact page.
 *
 * Reuses the legacy coordinates (16.8446, 74.5898 — Sangli), which were the one
 * genuinely working element on the old contact page; everything around them was
 * OS-Templates lorem ipsum (PRD A4.12).
 *
 * loading="lazy" keeps the third-party iframe off the critical path so it can't
 * drag down the Lighthouse score (PRD B7).
 */
export default function MapEmbed({ className }) {
  const { embedUrl, directionsUrl, label } = siteConfig.map

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-4xl border border-ink-200 shadow-card">
        <iframe
          src={embedUrl}
          title={`Map showing the location of ${label}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="block h-[22rem] w-full border-0 sm:h-[26rem]"
        />

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-ink-900 shadow-card-hover transition-transform duration-200 hover:scale-105"
        >
          <Icon name="mapPin" size={16} className="text-brand-500" />
          Get directions
          <Icon name="arrowUpRight" size={14} />
        </a>
      </div>
    </div>
  )
}
