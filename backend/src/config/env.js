import dotenv from 'dotenv'

dotenv.config()

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toBool = (value, fallback = false) => {
  if (value === undefined || value === '') return fallback
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

const toList = (value, fallback = []) =>
  value
    ? String(value)
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    : fallback

/**
 * Centralised, validated access to process.env. Add new variables here (with a
 * sane default where it makes sense) instead of reading process.env directly
 * elsewhere in the app.
 */
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 5000),

  /** Allowed browser origins. Comma-separate for multiple deployments. */
  clientUrls: toList(process.env.CLIENT_URL, ['http://localhost:5173']),

  mongodbUri:
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/my_app',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_dev_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  /**
   * Number of proxy hops in front of this server (0 when running directly).
   * express-rate-limit needs an accurate value to identify client IPs, and
   * rejects the blanket `true` because it lets anyone spoof X-Forwarded-For.
   */
  trustProxy: toInt(process.env.TRUST_PROXY, 0),

  mail: {
    /** 'smtp' | 'resend' | 'console'. Defaults to console so forms work unconfigured. */
    provider: (process.env.MAIL_PROVIDER || 'console').toLowerCase(),

    /** Envelope sender. */
    from: process.env.MAIL_FROM || 'App Support <no-reply@example.com>',

    to: toList(process.env.MAIL_TO, ['admin@example.com']),

    smtp: {
      host: process.env.SMTP_HOST || '',
      port: toInt(process.env.SMTP_PORT, 587),
      secure: toBool(process.env.SMTP_SECURE, false),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },

    resendApiKey: process.env.RESEND_API_KEY || '',
  },

  captcha: {
    /**
     * Cloudflare Turnstile secret. Empty by default: the forms ship protected by
     * honeypot + timing + rate limiting, and Turnstile verification activates
     * automatically once this and the frontend's VITE_TURNSTILE_SITE_KEY are set.
     */
    turnstileSecret: process.env.TURNSTILE_SECRET_KEY || '',
    verifyUrl: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  },

  upload: {
    maxFileSizeBytes: toInt(process.env.MAX_UPLOAD_BYTES, 5 * 1024 * 1024),
    allowedExtensions: ['.pdf', '.doc', '.docx'],
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },

  spam: {
    /** A human cannot complete these forms faster than this. */
    minFormFillMs: toInt(process.env.MIN_FORM_FILL_MS, 3000),
    /** Reject stale tabs — the token is too old to be a real session. */
    maxFormAgeMs: toInt(process.env.MAX_FORM_AGE_MS, 6 * 60 * 60 * 1000),
  },

  rateLimit: {
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    /** Submissions per IP per window. The legacy PHP allowed 1 per 300s. */
    max: toInt(process.env.RATE_LIMIT_MAX, 5),
  },
}

export const isProduction = env.nodeEnv === 'production'

/** True once a real mail transport is configured. */
export const isMailConfigured =
  (env.mail.provider === 'smtp' && Boolean(env.mail.smtp.host)) ||
  (env.mail.provider === 'resend' && Boolean(env.mail.resendApiKey))

/** True once Turnstile is configured on this server. */
export const isCaptchaEnabled = Boolean(env.captcha.turnstileSecret)

/**
 * Warns loudly about configuration that is fine locally but wrong in
 * production. Called once at startup.
 */
export function reportConfigWarnings() {
  const warnings = []

  if (!isMailConfigured) {
    warnings.push(
      `MAIL_PROVIDER is "${env.mail.provider}" — submissions will be logged to the console, not emailed. Set MAIL_PROVIDER=smtp (with SMTP_*) or resend (with RESEND_API_KEY) to deliver mail.`
    )
  }

  if (!process.env.MAIL_TO) {
    warnings.push(
      `MAIL_TO is not set — falling back to ${env.mail.to.join(', ')}. Confirm the real recipient before launch (PRD B11.5).`
    )
  }

  if (!isCaptchaEnabled) {
    warnings.push(
      'TURNSTILE_SECRET_KEY is not set — running with honeypot, timing and rate-limit protection only.'
    )
  }

  if (isProduction && warnings.length) {
    warnings.forEach((warning) => console.warn(`[config] WARNING: ${warning}`))
  } else if (warnings.length) {
    warnings.forEach((warning) => console.warn(`[config] ${warning}`))
  }
}
