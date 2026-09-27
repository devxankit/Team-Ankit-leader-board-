import Container from '@/components/ui/Container'
import Icon from '@/components/ui/Icon'
import { siteConfig } from '@/config/site'

/**
 * Thin utility strip above the header, carrying the same phone + email the
 * legacy topbar did (PRD A2). Hidden on small screens where the drawer surfaces
 * the same details with room to breathe.
 */
export default function TopBar() {
  const { phone, phoneHref, email, emailHref } = siteConfig.contact

  return (
    <div className="hidden bg-ink-950 text-white/70 md:block">
      <Container width="wide">
        <div className="flex h-10 items-center justify-between text-xs">
          <p className="tracking-wide">{siteConfig.tagline}</p>

          <div className="flex items-center gap-6">
            <a
              href={phoneHref}
              className="flex items-center gap-2 transition-colors hover:text-amber-brand-400"
            >
              <Icon name="phone" size={14} />
              <span>{phone}</span>
            </a>
            <a
              href={emailHref}
              className="flex items-center gap-2 transition-colors hover:text-amber-brand-400"
            >
              <Icon name="mail" size={14} />
              <span>{email}</span>
            </a>
          </div>
        </div>
      </Container>
    </div>
  )
}
