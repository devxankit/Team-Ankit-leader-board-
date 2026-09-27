export const ROLES = Object.freeze({ ADMIN: 'admin', MEMBER: 'member' })

export const PERIODS = Object.freeze(['all', 'month', 'week'])

export const RULE_CATEGORIES = Object.freeze([
  'Delivery',
  'Discipline',
  'Conduct',
  'Teamwork',
  'Client',
  'Other',
])

/** Largest absolute value a rule or one-off entry may award or deduct. */
export const MAX_POINTS = 1000

export const NOTE_MAX_LENGTH = 140
export const LABEL_MAX_LENGTH = 60
export const NAME_MAX_LENGTH = 60

/** bcrypt only uses the first 72 bytes of a password. */
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72

/** Name of the httpOnly session cookie. */
export const SESSION_COOKIE = 'ta_session'

/**
 * Avatar backgrounds. Every shade keeps white initials at ≥ 4.5:1 contrast, and
 * pure red/green are left out so avatars never read as a reward or penalty.
 */
export const AVATAR_COLORS = Object.freeze([
  '#4F46E5', // indigo
  '#0369A1', // sky
  '#0F766E', // teal
  '#7C3AED', // violet
  '#B45309', // amber
  '#BE185D', // pink
  '#2563EB', // blue
  '#A21CAF', // fuchsia
  '#C2410C', // orange
  '#0E7490', // cyan
  '#9333EA', // purple
  '#475569', // slate
])
