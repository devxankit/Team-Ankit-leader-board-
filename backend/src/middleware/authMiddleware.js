import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import User from '../models/User.js'

export async function protect(req, res, next) {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies && (req.cookies.token || req.cookies.adminToken)) {
    token = req.cookies.token || req.cookies.adminToken
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, token missing', { code: 'UNAUTHORIZED' })
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      throw new ApiError(401, 'User no longer exists', { code: 'USER_NOT_FOUND' })
    }

    req.user = user
    next()
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token', { code: 'INVALID_TOKEN' })
  }
}

export async function protectAdmin(req, res, next) {
  await protect(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next()
    } else {
      throw new ApiError(403, 'Forbidden: Admin access required', { code: 'FORBIDDEN' })
    }
  })
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, `User role '${req.user?.role}' is not authorized to access this resource`)
    }
    next()
  }
}
