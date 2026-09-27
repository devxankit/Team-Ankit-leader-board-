// Centralised access to Vite env vars.
// Add new VITE_* variables here so the rest of the app never touches
// import.meta.env directly.
export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  appName: import.meta.env.VITE_APP_NAME || 'Vrushahi Group',
  mode: import.meta.env.MODE,

  /**
   * Cloudflare Turnstile site key. Left empty by default: the forms ship with
   * honeypot + timing + server-side rate limiting, and the Turnstile widget
   * mounts itself only once a real key is present here. See
   * backend/src/services/captcha.service.js for the matching server half.
   */
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY || '',
}

/** True once a Turnstile site key has been configured. */
export const isTurnstileEnabled = Boolean(env.turnstileSiteKey)
