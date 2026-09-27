import { ApiError } from '../utils/ApiError.js'

/** Unknown /api routes get the standard JSON error envelope. */
export function notFound(req, res, next) {
  next(ApiError.notFound(`No API route for ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'))
}
