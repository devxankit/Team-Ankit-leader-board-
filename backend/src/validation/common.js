import { z } from 'zod'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../config/constants.js'

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

export const idParams = z.object({ id: objectId })

export const requiredText = (label, max) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`)

export const email = z
  .string({ error: 'Email is required' })
  .trim()
  .toLowerCase()
  .pipe(z.email('Enter a valid email address'))

export const newPassword = z
  .string({ error: 'Password is required' })
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters`)

/** Treats an empty query value (`?member=`) the same as leaving it out. */
export const blankAsMissing = (schema) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema)

export const pageParam = blankAsMissing(z.coerce.number().int().min(1).default(1))

export const limitParam = (max, fallback) =>
  blankAsMissing(z.coerce.number().int().min(1).max(max).default(fallback))

/** PATCH bodies must change at least one field. */
export const atLeastOneField = (schema) =>
  schema.refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: 'Nothing to update',
  })
