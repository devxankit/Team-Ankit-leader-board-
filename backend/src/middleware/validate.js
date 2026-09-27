import { ApiError } from '../utils/ApiError.js'

const collectFieldErrors = (issues, fallbackKey) => {
  const fieldErrors = {}
  for (const issue of issues) {
    const key = issue.path.join('.') || fallbackKey
    // First message per field wins — forms show one error per input.
    fieldErrors[key] ??= issue.message
  }
  return fieldErrors
}

/**
 * Validates request params, query and body against Zod schemas.
 *
 * Parsed (trimmed, coerced, defaulted) values land on `req.valid.{params,query,body}`;
 * `req.body` is also replaced so handlers only ever see clean input. Express 5
 * makes `req.query` read-only, which is why parsed values live on `req.valid`.
 *
 * @param {{ params?: import('zod').ZodType, query?: import('zod').ZodType, body?: import('zod').ZodType }} schemas
 */
export function validate(schemas) {
  return function validateRequest(req, res, next) {
    const valid = {}

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params ?? {})
      if (!result.success) throw ApiError.badRequest('That link contains an invalid id.', { code: 'INVALID_ID' })
      valid.params = result.data
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query ?? {})
      if (!result.success) {
        throw ApiError.badRequest('Some filters are invalid.', {
          code: 'INVALID_QUERY',
          fieldErrors: collectFieldErrors(result.error.issues, 'query'),
        })
      }
      valid.query = result.data
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body ?? {})
      if (!result.success) throw ApiError.validation(collectFieldErrors(result.error.issues, '_form'))
      valid.body = result.data
      req.body = result.data
    }

    req.valid = valid
    next()
  }
}
