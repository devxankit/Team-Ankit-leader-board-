import { useEffect, useState } from 'react'

/**
 * True once the page has scrolled past `threshold` pixels.
 *
 * Used by the header (condense on scroll) and the back-to-top button (fade in
 * on scroll). Listener is passive so it never blocks scrolling.
 *
 * @param {number} [threshold=8]
 */
export function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = 0

    const onScroll = () => {
      // Coalesce to one read per frame — scroll fires far more often than paint.
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold)
        frame = 0
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [threshold])

  return scrolled
}
