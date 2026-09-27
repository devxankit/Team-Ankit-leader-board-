import { changeOwnPassword, loginWithPassword, signSessionToken } from '../services/auth.service.js'
import { sendOk } from '../utils/respond.js'
import { toSessionUser } from '../utils/serializers.js'
import { clearSessionCookie, setSessionCookie } from '../utils/sessionCookie.js'

const firstName = (name) => name.trim().split(/\s+/)[0]

function startSession(res, user) {
  const { token, expiresAt } = signSessionToken(user)
  setSessionCookie(res, token, expiresAt)
}

export async function login(req, res) {
  const user = await loginWithPassword(req.body.email, req.body.password)
  startSession(res, user)
  sendOk(res, { user: toSessionUser(user) }, `Welcome back, ${firstName(user.name)}!`)
}

export function logout(req, res) {
  clearSessionCookie(res)
  sendOk(res, null, 'Signed out.')
}

/** `user` is null for visitors — not an error, since the leaderboard is public. */
export function me(req, res) {
  sendOk(res, { user: req.user ? toSessionUser(req.user) : null })
}

export async function changePassword(req, res) {
  const user = await changeOwnPassword(req.user._id, req.body.currentPassword, req.body.newPassword)
  // Sessions on other devices were revoked by the change; this one gets a fresh cookie.
  startSession(res, user)
  sendOk(res, { user: toSessionUser(user) }, 'Password updated.')
}
