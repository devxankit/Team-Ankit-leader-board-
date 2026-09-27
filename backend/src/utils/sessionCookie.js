import { env } from '../config/env.js'
import { SESSION_COOKIE } from '../config/constants.js'

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.cookie.secure,
  sameSite: env.cookie.sameSite,
  path: '/',
})

export function setSessionCookie(res, token, expiresAt) {
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), expires: expiresAt })
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, cookieOptions())
}
