import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import SocialIcons from '@/components/ui/SocialIcons'
import { EASE_OUT } from '@/components/motion/variants'
import { getAboutLinks, getGroupMenuColumns, getPrimaryNav } from '@/data/navigation'
import { siteConfig } from '@/config/site'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { cn } from '@/lib/cn'
import Logo from './Logo'

/**
 * Mobile navigation drawer (PRD B6.1 / B12).
 *
 * Slides in from the right with an animated accordion for the About and Group
 * submenus. The Group submenu keeps its cluster structure as headings rather
 * than a second collapsible level, so every division is one tap away instead of
 * three.
 */
export default function MobileDrawer({ open, onClose }) {
  const [expanded, setExpanded] = useState(null)
  const panelRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previouslyFocused = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  useLockBodyScroll(open)

  // Collapse accordions whenever the drawer closes.
  useEffect(() => {
    if (!open) setExpanded(null)
  }, [open])

  // Escape to dismiss; keep Tab inside the panel while it's open.
  useEffect(() => {
    if (!open) return undefined

    previouslyFocused.current = document.activeElement
    closeButtonRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  const nav = getPrimaryNav()
  const aboutLinks = getAboutLinks()
  const groupColumns = getGroupMenuColumns()
  const accordionDuration = prefersReducedMotion ? 0 : 0.32

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-60 lg:hidden">
          <motion.button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 h-full w-full cursor-default bg-ink-950/60 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.34, ease: EASE_OUT }}
            className="absolute inset-y-0 right-0 flex w-[min(23rem,88vw)] flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
              <Logo />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100"
              >
                <Icon name="close" size={22} />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="flex flex-col gap-0.5">
                {nav.map((item) => {
                  if (!item.children) {
                    return (
                      <li key={item.id}>
                        <Link
                          to={item.to}
                          onClick={onClose}
                          className="flex items-center justify-between rounded-xl px-4 py-3 font-display text-base font-semibold text-ink-900 transition-colors hover:bg-ink-50"
                        >
                          {item.label}
                          <Icon name="chevronRight" size={17} className="text-ink-400" />
                        </Link>
                      </li>
                    )
                  }

                  const isOpen = expanded === item.id

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setExpanded(isOpen ? null : item.id)}
                        className="flex w-full items-center justify-between rounded-xl px-4 py-3 font-display text-base font-semibold text-ink-900 transition-colors hover:bg-ink-50"
                      >
                        {item.label}
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                          className="flex text-ink-400"
                        >
                          <Icon name="chevronDown" size={17} />
                        </motion.span>
                      </button>

                      <motion.div
                        initial={false}
                        animate={{
                          height: isOpen ? 'auto' : 0,
                          opacity: isOpen ? 1 : 0,
                        }}
                        transition={{ duration: accordionDuration, ease: EASE_OUT }}
                        className="overflow-hidden"
                      >
                        <div className="px-2 pt-1 pb-3">
                          <SubLink to={item.to} label="Overview" onClose={onClose} />

                          {item.id === 'about'
                            ? aboutLinks.map((link) => (
                                <SubLink
                                  key={link.to}
                                  to={link.to}
                                  label={link.label}
                                  onClose={onClose}
                                />
                              ))
                            : groupColumns.map((column) => (
                                <div key={column.title} className="mt-3 first:mt-2">
                                  {column.clusters
                                    ? column.clusters.map((cluster) => (
                                        <div key={cluster.title} className="mt-3 first:mt-0">
                                          <p className="px-4 pb-1 text-[11px] font-semibold tracking-[0.16em] text-ink-400 uppercase">
                                            {cluster.title}
                                          </p>
                                          {cluster.links.map((link) => (
                                            <SubLink
                                              key={link.to}
                                              to={link.to}
                                              label={link.label}
                                              onClose={onClose}
                                            />
                                          ))}
                                        </div>
                                      ))
                                    : (
                                        <>
                                          <p className="px-4 pb-1 text-[11px] font-semibold tracking-[0.16em] text-ink-400 uppercase">
                                            {column.title}
                                          </p>
                                          {column.links.map((link) => (
                                            <SubLink
                                              key={link.to}
                                              to={link.to}
                                              label={link.label}
                                              onClose={onClose}
                                            />
                                          ))}
                                        </>
                                      )}
                                </div>
                              ))}
                        </div>
                      </motion.div>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="border-t border-ink-200 bg-ink-50 px-5 py-5">
              <Button to="/contact" fullWidth onClick={onClose} className="mb-4">
                Get in touch
              </Button>

              <div className="flex flex-col gap-2 text-sm text-ink-600">
                <a
                  href={siteConfig.contact.phoneHref}
                  className="flex items-center gap-2.5 transition-colors hover:text-brand-700"
                >
                  <Icon name="phone" size={15} className="text-ink-400" />
                  {siteConfig.contact.phone}
                </a>
                <a
                  href={siteConfig.contact.emailHref}
                  className="flex items-center gap-2.5 transition-colors hover:text-brand-700"
                >
                  <Icon name="mail" size={15} className="text-ink-400" />
                  {siteConfig.contact.email}
                </a>
              </div>

              <SocialIcons className="mt-4 [&_a]:border-ink-200 [&_a]:text-ink-500 [&_a]:hover:text-white" />
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

function SubLink({ to, label, onClose }) {
  return (
    <Link
      to={to}
      onClick={onClose}
      className={cn(
        'block rounded-lg px-4 py-2.5 text-sm text-ink-600 transition-colors',
        'hover:bg-white hover:text-brand-700'
      )}
    >
      {label}
    </Link>
  )
}
