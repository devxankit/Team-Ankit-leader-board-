import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ROLES } from '../config/constants.js'
import { env } from '../config/env.js'
import User from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'

// Comparing against a throwaway hash when an email is unknown keeps login
// timing the same either way, so it can't be used to probe which emails exist.
let dummyHash
const getDummyHash = () => (dummyHash ??= bcrypt.hash('timing-equaliser', env.bcryptRounds))

export function signSessionToken(user) {
  const token = jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  })
  const { exp } = jwt.decode(token)
  return { token, expiresAt: new Date(exp * 1000) }
}

/**
 * Resolves a session token to the signed-in admin, re-checking the database on
 * every call so deactivation and password changes take effect immediately.
 * Only the admin can hold a session — the leaderboard itself is public.
 */
export async function authenticateToken(token) {
  let payload
  try {
    payload = jwt.verify(token, env.jwtSecret)
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.', 'SESSION_EXPIRED')
  }

  const user = await User.findById(payload.sub).lean()
  if (!user || user.role !== ROLES.ADMIN) {
    throw ApiError.unauthorized('This session is no longer valid. Please sign in again.', 'SESSION_INVALID')
  }
  if (!user.isActive) {
    throw ApiError.unauthorized('This account has been deactivated.', 'ACCOUNT_DEACTIVATED')
  }

  // JWT `iat` has one-second resolution, so compare whole seconds.
  const changedAt = user.passwordChangedAt ? Math.floor(user.passwordChangedAt.getTime() / 1000) : 0
  if (payload.iat < changedAt) {
    throw ApiError.unauthorized('Your password was changed. Please sign in again.', 'SESSION_REVOKED')
  }

  return user
}

export async function loginWithPassword(email, password) {
  const user = await User.findOne({ email, role: ROLES.ADMIN }).select('+passwordHash')

  if (!user) {
    await bcrypt.compare(password, await getDummyHash())
    throw ApiError.unauthorized('Incorrect email or password.', 'INVALID_CREDENTIALS')
  }

  if (!(await user.verifyPassword(password))) {
    throw ApiError.unauthorized('Incorrect email or password.', 'INVALID_CREDENTIALS')
  }

  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated.', 'ACCOUNT_DEACTIVATED')
  }

  return user
}

export async function changeOwnPassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+passwordHash')
  if (!user) throw ApiError.unauthorized('This account no longer exists.', 'SESSION_INVALID')

  if (!(await user.verifyPassword(currentPassword))) {
    throw ApiError.validation({ currentPassword: 'Current password is incorrect.' })
  }
  if (currentPassword === newPassword) {
    throw ApiError.validation({ newPassword: 'Choose a password different from the current one.' })
  }

  await user.setPassword(newPassword)
  await user.save()
  return user
}
