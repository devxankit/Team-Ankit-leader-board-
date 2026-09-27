import { motion } from 'motion/react'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/cn'
import Icon from './Icon'

/**
 * Renders only the social accounts confirmed to exist.
 *
 * The legacy footer shipped four icons of which three linked to "#" (PRD A2 /
 * B6.6). Rather than repeat that, this maps over `siteConfig.socials` — add an
 * entry there as each account is confirmed and its icon appears here.
 */
export default function SocialIcons({ className, iconSize = 18 }) {
  const socials = siteConfig.socials

  if (!socials.length) return null

  return (
    <ul className={cn('flex items-center gap-2.5', className)}>
      {socials.map((social) => (
        <li key={social.id}>
          <motion.a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${siteConfig.name} on ${social.label}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-200 hover:text-white"
            whileHover={{
              scale: 1.08,
              backgroundColor: social.brandColor,
              borderColor: social.brandColor,
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Icon name={social.id} size={iconSize} />
          </motion.a>
        </li>
      ))}
    </ul>
  )
}
