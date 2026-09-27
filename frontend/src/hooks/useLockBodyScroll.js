import { useEffect } from 'react'

/**
 * Freezes background scrolling while a modal surface (the mobile drawer) is
 * open, compensating for the scrollbar so the page doesn't jump sideways.
 *
 * @param {boolean} locked
 */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined

    const { body, documentElement } = document
    const previousOverflow = body.style.overflow
    const previousPaddingRight = body.style.paddingRight
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
    }
  }, [locked])
}
