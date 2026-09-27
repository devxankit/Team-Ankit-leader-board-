import { ApiError } from '../utils/ApiError.js'

/**
 * Validates req.body against a Zod schema, replacing it with the parsed
 * (trimmed, coerced, normalised) result so controllers only ever see clean
 * data.
 *
 * Failures become a 422 carrying a { field: message } map, which React Hook
 * Form drops straight onto the matching inputs.
 *
 * @param {import('zod').ZodTypeAny} schema
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const fieldErrors = {}

      // First message per field wins — the UI shows one error per input.
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || '_form'
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }

      throw ApiError.validation('Please correct the highlighted fields.', fieldErrors)
    }

    req.body = result.data
    next()
  }
}
