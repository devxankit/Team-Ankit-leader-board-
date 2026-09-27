import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { siteConfig } from '@/config/site'

/**
 * Per-page document metadata.
 *
 * Fixes one of the loudest legacy problems (PRD B7): all 29 old pages shipped
 * the identical `<title>VRUSHAHI GROUP</title>` and no meta description.
 *
 * Implemented imperatively rather than with React 19's metadata hoisting,
 * because index.html carries a static <title> as the pre-hydration/no-JS
 * fallback — a hoisted <title> would be *appended* after it and browsers honour
 * whichever comes first, so per-page titles would silently never apply.
 * Setting document.title directly is unambiguous.
 *
 * @param {Object} props
 * @param {string} [props.title]        - page title, brand suffix added automatically
 * @param {string} [props.description]
 * @param {boolean} [props.noIndex=false]
 */
export default function Seo({ title, description, noIndex = false }) {
  const { pathname } = useLocation()

  useEffect(() => {
    const fullTitle = title ? `${title} — ${siteConfig.name}` : siteConfig.name
    const desc = description || siteConfig.description
    const url = `${siteConfig.url}${pathname}`

    document.title = fullTitle

    upsertMeta({ name: 'description' }, desc)
    upsertMeta({ property: 'og:title' }, fullTitle)
    upsertMeta({ property: 'og:description' }, desc)
    upsertMeta({ property: 'og:url' }, url)
    upsertMeta({ property: 'og:type' }, 'website')
    upsertMeta({ property: 'og:site_name' }, siteConfig.name)
    upsertMeta({ name: 'twitter:card' }, 'summary_large_image')
    upsertMeta({ name: 'twitter:title' }, fullTitle)
    upsertMeta({ name: 'twitter:description' }, desc)
    upsertMeta({ name: 'robots' }, noIndex ? 'noindex, nofollow' : 'index, follow')

    upsertLink('canonical', url)
  }, [title, description, noIndex, pathname])

  return null
}

/**
 * Creates or updates a <meta> tag identified by its name/property attribute.
 * @param {{name?: string, property?: string}} identifier
 * @param {string} content
 */
function upsertMeta(identifier, content) {
  const [attr, value] = Object.entries(identifier)[0]
  const selector = `meta[${attr}="${value}"]`

  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, value)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

/** Creates or updates a <link rel="..."> tag. */
function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}
