import { ROLES, SESSION_COOKIE } from '../config/constants.js'
import { authenticateToken } from '../services/auth.service.js'
import { ApiError } from '../utils/ApiError.js'
import { clearSessionCookie } from '../utils/sessionCookie.js'

async function resolveSession(req, res) {
  const token = req.cookies?.[SESSION_COOKIE]
  if (!token) return null
  try {
    return await authenticateToken(token)
  } catch (error) {
    // A dead session cookie is useless to the browser — drop it.
    clearSessionCookie(res)
    throw error
  }
}

/** A signed-in session (only the admin can sign in). */
export async function requireAuth(req, res, next) {
  const user = await resolveSession(req, res)
  if (!user) throw ApiError.unauthorized()
  req.user = user
  next()
}

/** Attaches the signed-in user when there is one; visitors pass through as anonymous. */
export async function optionalAuth(req, res, next) {
  try {
    req.user = await resolveSession(req, res)
  } catch {
    req.user = null
  }
  next()
}

/** Must run after requireAuth. The role check lives on the server, not just in the UI. */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Only the admin can do that.', 'ADMIN_ONLY')
  }
  next()
}
