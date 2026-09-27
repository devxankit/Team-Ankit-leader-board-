import { z } from 'zod'
import {
  AVATAR_COLORS,
  LABEL_MAX_LENGTH,
  MAX_POINTS,
  NAME_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  RULE_CATEGORIES,
} from '../config/constants.js'
import {
  atLeastOneField,
  blankAsMissing,
  limitParam,
  objectId,
  pageParam,
  requiredText,
} from './common.js'

// ── Members ────────────────────────────────────────────────────────────────

const personName = z
  .string({ error: 'Name is required' })
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(NAME_MAX_LENGTH, `Name must be ${NAME_MAX_LENGTH} characters or fewer`)

const designation = z
  .string()
  .trim()
  .max(NAME_MAX_LENGTH, `Designation must be ${NAME_MAX_LENGTH} characters or fewer`)

const avatarColor = z.enum(AVATAR_COLORS, { error: 'Pick one of the palette colours' })

export const listMembersQuery = z.object({
  status: blankAsMissing(z.enum(['active', 'inactive', 'all']).default('all')),
})

/** Teammates don't sign in, so a member is just a name, designation and colour. */
export const createMemberBody = z.object({
  name: personName,
  designation: designation.default(''),
  avatarColor: avatarColor.optional(),
})

export const updateMemberBody = atLeastOneField(
  z.object({
    name: personName.optional(),
    designation: designation.optional(),
    avatarColor: avatarColor.optional(),
  })
)

export const memberStatusBody = z.object({
  isActive: z.boolean({ error: 'isActive must be true or false' }),
})

// ── Rules ──────────────────────────────────────────────────────────────────

const ruleLabel = requiredText('Label', LABEL_MAX_LENGTH)
const ruleType = z.enum(['reward', 'penalty'], { error: 'Choose reward or penalty' })
const ruleAmount = z
  .number({ error: 'Points must be a number' })
  .int('Points must be a whole number')
  .min(1, 'Points must be at least 1')
  .max(MAX_POINTS, `Points can be at most ${MAX_POINTS}`)
const category = z.enum(RULE_CATEGORIES, { error: 'Pick a category' })
const icon = z.string().trim().max(16, 'Use a single emoji')

export const listRulesQuery = z.object({
  status: blankAsMissing(z.enum(['active', 'archived', 'all']).default('active')),
})

/** Rules take a type plus a positive amount; the server stores the signed number. */
export const createRuleBody = z.object({
  label: ruleLabel,
  type: ruleType,
  points: ruleAmount,
  category: category.default('Other'),
  icon: icon.default(''),
})

export const updateRuleBody = atLeastOneField(
  z.object({
    label: ruleLabel.optional(),
    type: ruleType.optional(),
    points: ruleAmount.optional(),
    category: category.optional(),
    icon: icon.optional(),
    isActive: z.boolean().optional(),
  })
)

// ── Give / take points ─────────────────────────────────────────────────────

const signedPoints = z
  .number({ error: 'Points must be a number' })
  .int('Points must be a whole number')
  .refine((value) => value !== 0, 'Points cannot be 0')
  .refine((value) => Math.abs(value) <= MAX_POINTS, `Keep points between -${MAX_POINTS} and ${MAX_POINTS}`)

export const applyPointsBody = z
  .object({
    memberIds: z
      .array(objectId, { error: 'Pick at least one person' })
      .min(1, 'Pick at least one person')
      .max(500, 'Too many people at once'),
    ruleId: objectId.optional(),
    /** A one-off entry without creating a rule. `points` is signed. */
    custom: z.object({ label: ruleLabel, points: signedPoints }).optional(),
    note: z
      .string()
      .trim()
      .max(NOTE_MAX_LENGTH, `Keep the note to ${NOTE_MAX_LENGTH} characters`)
      .default(''),
  })
  .superRefine((value, ctx) => {
    if (Boolean(value.ruleId) === Boolean(value.custom)) {
      ctx.addIssue({
        code: 'custom',
        path: ['ruleId'],
        message: 'Pick a rule or enter a custom entry',
      })
    }
  })

// ── Activity log ───────────────────────────────────────────────────────────

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')

export const listEventsQuery = z
  .object({
    member: blankAsMissing(objectId.optional()),
    rule: blankAsMissing(z.union([objectId, z.literal('custom')]).optional()),
    type: blankAsMissing(z.enum(['reward', 'penalty']).optional()),
    status: blankAsMissing(z.enum(['active', 'voided', 'all']).default('all')),
    from: blankAsMissing(isoDate.optional()),
    to: blankAsMissing(isoDate.optional()),
    page: pageParam,
    limit: limitParam(100, 25),
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    path: ['to'],
    message: 'The end date must be on or after the start date',
  })
