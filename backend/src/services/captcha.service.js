import { env, isCaptchaEnabled } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

/**
 * Cloudflare Turnstile verification (PRD B6.2).
 *
 * Dormant by design: with no TURNSTILE_SECRET_KEY configured this middleware
 * steps aside and the forms rely on honeypot + timing + rate limiting, which
 * need no third-party account. Set the secret here and VITE_TURNSTILE_SITE_KEY
 * on the frontend and verification switches on with no code change.
 */
export async function verifyCaptcha(req, res, next) {
  if (!isCaptchaEnabled) {
    next()
    return
  }

  const token = req.body?.captchaToken

  if (!token) {
    throw ApiError.validation('Please complete the verification challenge.', {
      captchaToken: 'Verification required',
    })
  }

  const body = new URLSearchParams({
    secret: env.captcha.turnstileSecret,
    response: token,
  })

  // Cloudflare uses this to spot tokens replayed from a different network.
  const remoteIp = req.ip
  if (remoteIp) body.append('remoteip', remoteIp)

  let outcome
  try {
    const response = await fetch(env.captcha.verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(8000),
    })
    outcome = await response.json()
  } catch (error) {
    // Never fail open: an unreachable verifier means we cannot tell human from bot.
    console.error('[captcha] Turnstile verification request failed:', error.message)
    throw new ApiError(
      503,
      'We could not verify your submission right now. Please try again shortly.',
      { code: 'CAPTCHA_UNAVAILABLE' }
    )
  }

  if (!outcome?.success) {
    throw ApiError.validation('Verification failed. Please try again.', {
      captchaToken: 'Verification failed',
    })
  }

  next()
}
