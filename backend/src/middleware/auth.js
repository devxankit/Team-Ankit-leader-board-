import { ROLES, SESSION_COOKIE } from '../config/constants.js'
import { authenticateToken } from '../services/auth.service.js'
import { ApiError } from '../utils/ApiError.js'
import { clearSessionCookie } from '../utils/sessionCookie.js'

function authenticate({ allowPendingPasswordChange = false } = {}) {
  return async function authenticateRequest(req, res, next) {
    const token = req.cookies?.[SESSION_COOKIE]
    if (!token) throw ApiError.unauthorized()

    let user
    try {
      user = await authenticateToken(token)
    } catch (error) {
      // A dead session cookie is useless to the browser — drop it.
      clearSessionCookie(res)
      throw error
    }

    if (user.mustChangePassword && !allowPendingPasswordChange) {
      throw ApiError.forbidden('Set a new password to continue.', 'PASSWORD_CHANGE_REQUIRED')
    }

    req.user = user
    next()
  }
}

/** Signed in and past first-login password setup. */
export const requireAuth = authenticate()

/** Signed in, possibly still on a temporary password (for /auth/me and /auth/change-password). */
export const requireSession = authenticate({ allowPendingPasswordChange: true })

/** Must run after requireAuth. The role check lives on the server, not just in the UI. */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Only the admin can do that.', 'ADMIN_ONLY')
  }
  next()
}
