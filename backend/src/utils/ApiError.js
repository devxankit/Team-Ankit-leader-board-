/**
 * Error carrying an HTTP status code, and optionally per-field validation
 * messages that the client renders next to the offending input.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {Object} [options]
   * @param {Record<string, string>} [options.fieldErrors]
   * @param {string} [options.code] - stable machine-readable identifier
   */
  constructor(statusCode, message, { fieldErrors, code } = {}) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.fieldErrors = fieldErrors
    this.code = code
    Error.captureStackTrace?.(this, ApiError)
  }

  static badRequest(message, options) {
    return new ApiError(400, message, options)
  }

  static validation(message, fieldErrors) {
    return new ApiError(422, message, { fieldErrors, code: 'VALIDATION_FAILED' })
  }

  static tooManyRequests(message) {
    return new ApiError(429, message, { code: 'RATE_LIMITED' })
  }
}
