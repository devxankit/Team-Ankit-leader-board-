/**
 * An error that maps straight onto an HTTP response. Throw it from anywhere —
 * Express 5 forwards thrown and rejected errors to the central error handler.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message - safe to show to the user
   * @param {object} [options]
   * @param {string} [options.code] - stable machine-readable identifier
   * @param {Record<string, string>} [options.fieldErrors] - per-input messages for forms
   */
  constructor(statusCode, message, { code, fieldErrors } = {}) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.fieldErrors = fieldErrors
  }

  static badRequest(message, options) {
    return new ApiError(400, message, { code: 'BAD_REQUEST', ...options })
  }

  static unauthorized(message = 'Please sign in to continue.', code = 'UNAUTHENTICATED') {
    return new ApiError(401, message, { code })
  }

  static forbidden(message = "You don't have access to this.", code = 'FORBIDDEN') {
    return new ApiError(403, message, { code })
  }

  static notFound(message = 'Not found.', code = 'NOT_FOUND') {
    return new ApiError(404, message, { code })
  }

  static conflict(message, { code = 'CONFLICT', fieldErrors } = {}) {
    return new ApiError(409, message, { code, fieldErrors })
  }

  static validation(fieldErrors, message = 'Please correct the highlighted fields.') {
    return new ApiError(422, message, { code: 'VALIDATION_FAILED', fieldErrors })
  }
}
