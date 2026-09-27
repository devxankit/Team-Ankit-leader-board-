import mongoose from 'mongoose'
import { isProduction, isTest } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

/**
 * Turns anything thrown into the standard envelope:
 *   { success: false, data: null, message, code?, fieldErrors? }
 * Keep this as the LAST middleware in app.js.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by their 4 arguments
export function errorHandler(err, req, res, next) {
  const apiError = toApiError(err)

  if (apiError.statusCode >= 500 && !isTest) {
    console.error('[error]', req.method, req.originalUrl, err)
  }

  res.status(apiError.statusCode).json({
    success: false,
    data: null,
    message: apiError.message,
    ...(apiError.code ? { code: apiError.code } : {}),
    ...(apiError.fieldErrors ? { fieldErrors: apiError.fieldErrors } : {}),
    ...(!isProduction && apiError.statusCode >= 500 ? { stack: err.stack } : {}),
  })
}

function toApiError(err) {
  if (err instanceof ApiError) return err

  // Malformed ObjectId that slipped past validation.
  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for ${err.path}.`, { code: 'INVALID_ID' })
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const fieldErrors = Object.fromEntries(
      Object.entries(err.errors).map(([field, detail]) => [field, detail.message])
    )
    return ApiError.validation(fieldErrors)
  }

  // Unique index violation (e.g. two people saving the same email at once).
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? err.keyPattern ?? {})[0] ?? 'value'
    return ApiError.conflict(`That ${field} is already in use.`, {
      code: 'DUPLICATE',
      fieldErrors: { [field]: `That ${field} is already in use.` },
    })
  }

  // Body parser failures.
  if (err?.type === 'entity.parse.failed') {
    return ApiError.badRequest('The request body is not valid JSON.', { code: 'INVALID_JSON' })
  }
  if (err?.type === 'entity.too.large') {
    return new ApiError(413, 'That request is too large.', { code: 'PAYLOAD_TOO_LARGE' })
  }

  return new ApiError(500, 'Something went wrong on our side. Please try again.', {
    code: 'INTERNAL_ERROR',
  })
}
