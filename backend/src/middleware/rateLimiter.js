import rateLimit from 'express-rate-limit'

const limitMessage = (message) => ({ success: false, data: null, message, code: 'RATE_LIMITED' })

/**
 * Failed sign-ins per IP. Successful logins don't count, so a whole office
 * sharing one public IP isn't locked out by normal use.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: limitMessage('Too many sign-in attempts. Please wait 15 minutes and try again.'),
})

/**
 * A generous ceiling on the whole API. Every live update makes each open
 * leaderboard refetch, and a team often shares one office IP, so this only
 * exists to blunt scripted abuse.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 1000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: limitMessage('Too many requests. Please slow down.'),
})
