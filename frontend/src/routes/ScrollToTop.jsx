import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Resets scroll position on navigation.
 *
 * A single-page app keeps the scroll offset across route changes by default,
 * so without this you land halfway down a freshly-opened page. In-page hash
 * links are left alone.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}
