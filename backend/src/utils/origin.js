import { env } from '../config/env.js'

/**
 * Browsers send an Origin header on cross-site requests and on same-site
 * writes. Allowing only our own host plus the configured CLIENT_URL list — and
 * rejecting everything else before it reaches a route — is the API's CSRF
 * defence, on top of the SameSite session cookie.
 */
export function isAllowedOrigin(origin, requestHost) {
  // No Origin header: curl, health checks, server-to-server calls.
  if (!origin) return true
  if (env.clientUrls.includes(origin)) return true

  try {
    return new URL(origin).host === requestHost
  } catch {
    return false
  }
}
