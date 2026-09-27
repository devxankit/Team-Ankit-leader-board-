import { useEffect, useRef } from 'react'
import { env, isTurnstileEnabled } from '@/config/env'

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let scriptPromise = null

/** Loads the Turnstile script once, however many widgets mount. */
function loadTurnstileScript() {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve(window.turnstile)
      return
    }

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.turnstile)
    script.onerror = () => reject(new Error('Failed to load Turnstile'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

/**
 * Cloudflare Turnstile widget — renders nothing unless a site key is
 * configured (PRD B6.2).
 *
 * The forms ship protected by honeypot + timing + server-side rate limiting, so
 * this stays dormant until VITE_TURNSTILE_SITE_KEY is set. When it is, the
 * widget mounts here and the token flows to the server, which verifies it with
 * the matching secret. No other code changes.
 *
 * @param {(token: string) => void} props.onVerify
 */
export default function TurnstileWidget({ onVerify }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const onVerifyRef = useRef(onVerify)

  // Keep the latest callback without re-rendering the widget.
  useEffect(() => {
    onVerifyRef.current = onVerify
  }, [onVerify])

  useEffect(() => {
    if (!isTurnstileEnabled) return undefined

    let cancelled = false

    loadTurnstileScript()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: env.turnstileSiteKey,
          callback: (token) => onVerifyRef.current?.(token),
          'expired-callback': () => onVerifyRef.current?.(''),
          'error-callback': () => onVerifyRef.current?.(''),
        })
      })
      .catch((error) => console.error('[turnstile]', error.message))

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [])

  if (!isTurnstileEnabled) return null

  return <div ref={containerRef} className="min-h-[65px]" />
}
