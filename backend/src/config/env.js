import dotenv from 'dotenv'
import { DateTime } from 'luxon'

dotenv.config({ quiet: true })

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

const nodeEnv = process.env.NODE_ENV || 'development'
const isProd = nodeEnv === 'production'

/**
 * Centralised access to process.env. Read configuration from here, never from
 * process.env directly, so every setting has one documented home.
 */
export const env = {
  nodeEnv,
  port: toInt(process.env.PORT, 5000),

  /** Interface to listen on. Unset = all interfaces; 127.0.0.1 keeps a proxied API off the public network. */
  host: (process.env.HOST || '').trim() || undefined,

  /** Browser origins allowed to call the API (comma-separated). */
  clientUrls: toList(process.env.CLIENT_URL, ['http://localhost:5173']),

  mongodbUri: (process.env.MONGODB_URI || '').trim(),

  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  /** bcrypt cost factor. Tests lower it; 12 is a sensible production default. */
  bcryptRounds: toInt(process.env.BCRYPT_ROUNDS, 12),

  /** IANA zone used for "this week" / "this month" boundaries and date filters. */
  timezone: process.env.APP_TIMEZONE || 'Asia/Kolkata',

  /** Number of reverse-proxy hops in front of the app (0 when run directly). */
  trustProxy: toInt(process.env.TRUST_PROXY, 0),

  cookie: {
    secure: toBool(process.env.COOKIE_SECURE, isProd),
    /** 'lax' for same-site deploys; 'none' (with HTTPS) if client and API live on different sites. */
    sameSite: (process.env.COOKIE_SAMESITE || 'lax').toLowerCase(),
  },

  /** Serve the built frontend (frontend/dist) from Express — one origin for pages, API and sockets. */
  serveClient: toBool(process.env.SERVE_CLIENT, isProd),

  admin: {
    name: (process.env.ADMIN_NAME || 'Admin').trim(),
    email: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || '',
  },
}

export const isProduction = isProd
export const isTest = nodeEnv === 'test'

/**
 * Fails fast with a readable message instead of letting a half-configured
 * server boot. Called once at startup by the server and the seed scripts.
 */
export function assertEnv(required = ['MONGODB_URI', 'JWT_SECRET']) {
  const problems = []

  for (const key of required) {
    if (!String(process.env[key] ?? '').trim()) problems.push(`${key} is not set`)
  }

  if (isProd && env.jwtSecret && env.jwtSecret.length < 32) {
    problems.push('JWT_SECRET must be at least 32 characters in production')
  }

  if (!DateTime.local().setZone(env.timezone).isValid) {
    problems.push(`APP_TIMEZONE "${env.timezone}" is not a valid IANA timezone (e.g. Asia/Kolkata)`)
  }

  if (!['lax', 'strict', 'none'].includes(env.cookie.sameSite)) {
    problems.push('COOKIE_SAMESITE must be lax, strict or none')
  } else if (env.cookie.sameSite === 'none' && !env.cookie.secure) {
    problems.push('COOKIE_SAMESITE=none only works over HTTPS — also set COOKIE_SECURE=true')
  }

  if (problems.length) {
    const list = problems.map((problem) => `  • ${problem}`).join('\n')
    throw new Error(`Configuration problem — fix backend/.env (see backend/.env.example):\n${list}`)
  }
}
