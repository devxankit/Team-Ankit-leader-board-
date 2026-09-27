import { ApiError } from '../utils/ApiError.js'

/**
 * Catches any request that didn't match a route and forwards a 404 to the
 * centralised error handler.
 */
export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found — ${req.method} ${req.originalUrl}`))
}
