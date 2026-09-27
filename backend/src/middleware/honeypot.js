import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

/**
 * Spam checks that cost the user nothing (PRD B6.2).
 *
 * Replaces the legacy hand-rolled math-captcha image (form/img.php + arial.ttf)
 * and its 300-second session lockout with two silent signals:
 *
 *   1. Honeypot — a field hidden from humans that bots fill in anyway.
 *   2. Timing   — the elapsed time between the form mounting and submitting.
 *
 * Both run before the mail service so junk never reaches an inbox. Rate
 * limiting (middleware/rateLimiter.js) and optional Turnstile verification
 * (services/captcha.service.js) sit alongside these.
 *
 * Rejections are deliberately vague: telling a bot which check it failed tells
 * it how to pass next time.
 */
export function honeypot(req, res, next) {
  const { website, formStartedAt } = req.body

  if (website) {
    throw ApiError.badRequest('Your submission could not be processed.', {
      code: 'SPAM_HONEYPOT',
    })
  }

  if (formStartedAt) {
    const elapsed = Date.now() - Number(formStartedAt)

    if (elapsed < env.spam.minFormFillMs) {
      throw ApiError.badRequest(
        'That was submitted a little too quickly — please try again.',
        { code: 'SPAM_TOO_FAST' }
      )
    }

    if (elapsed > env.spam.maxFormAgeMs) {
      throw ApiError.badRequest(
        'This form has been open for too long. Please refresh the page and try again.',
        { code: 'FORM_EXPIRED' }
      )
    }
  }

  next()
}
