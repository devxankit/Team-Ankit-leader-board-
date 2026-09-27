import multer from 'multer'
import { env, isProduction } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

/**
 * Centralised error handler — keep this as the LAST middleware registered in
 * app.js. Throw from anywhere (express-async-errors covers async handlers) and
 * errors land here.
 *
 * Normalises three shapes into one JSON envelope:
 *   { success: false, message, fieldErrors?, code? }
 *
 * `fieldErrors` is what React Hook Form maps onto individual inputs, so
 * server-side validation failures render exactly like client-side ones.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = 500
  let message = 'Something went wrong. Please try again.'
  let fieldErrors
  let code

  if (err instanceof ApiError) {
    statusCode = err.statusCode
    message = err.message
    fieldErrors = err.fieldErrors
    code = err.code
  } else if (err instanceof multer.MulterError) {
    statusCode = 422
    code = err.code

    if (err.code === 'LIMIT_FILE_SIZE') {
      const limitMb = Math.round(env.upload.maxFileSizeBytes / (1024 * 1024))
      message = 'Please correct the highlighted fields.'
      fieldErrors = { resume: `File is too large. Maximum size is ${limitMb} MB.` }
    } else {
      message = 'Please correct the highlighted fields.'
      fieldErrors = { resume: 'That file could not be accepted.' }
    }
  } else if (err.status === 404 || err.statusCode === 404) {
    statusCode = 404
    message = err.message
  } else if (err.type === 'entity.too.large') {
    statusCode = 413
    message = 'That request was too large.'
  }

  // Anything unrecognised is a genuine server fault — log it in full, but never
  // leak internals to the client in production.
  if (statusCode >= 500) {
    console.error('[error]', err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(fieldErrors ? { fieldErrors } : {}),
    ...(code ? { code } : {}),
    ...(isProduction ? {} : { stack: err.stack }),
  })
}
