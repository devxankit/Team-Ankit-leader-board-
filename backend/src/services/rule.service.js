import Rule from '../models/Rule.js'
import { ApiError } from '../utils/ApiError.js'
import { pointsType, toSignedPoints } from '../utils/points.js'
import { toRule } from '../utils/serializers.js'

const CASE_INSENSITIVE = { locale: 'en', strength: 2 }

async function findRuleOrThrow(id) {
  const rule = await Rule.findById(id)
  if (!rule) throw ApiError.notFound('That rule was not found.', 'RULE_NOT_FOUND')
  return rule
}

/** Two active rules with the same name would be indistinguishable in the picker. */
async function assertLabelAvailable(label, exceptId) {
  const filter = { label, isActive: true, ...(exceptId ? { _id: { $ne: exceptId } } : {}) }
  if (await Rule.exists(filter).collation(CASE_INSENSITIVE)) {
    throw ApiError.conflict('An active rule already has that name.', {
      code: 'RULE_EXISTS',
      fieldErrors: { label: 'An active rule already has that name.' },
    })
  }
}

/** @param {{ status?: 'active'|'archived'|'all' }} options */
export async function listRules({ status = 'active' } = {}) {
  const filter = status === 'all' ? {} : { isActive: status === 'active' }
  const rules = await Rule.find(filter)
    .collation(CASE_INSENSITIVE)
    .sort({ isActive: -1, points: -1, label: 1 })
    .lean()
  return rules.map(toRule)
}

/** The API takes a type plus a positive amount; the rule stores the signed number. */
export async function createRule({ label, type, points, category, icon }) {
  await assertLabelAvailable(label)
  const rule = await Rule.create({ label, points: toSignedPoints(type, points), category, icon })
  return toRule(rule)
}

/**
 * Past events keep their own snapshot of label and points, so edits here only
 * affect future entries.
 */
export async function updateRule(id, changes) {
  const rule = await findRuleOrThrow(id)

  const nextLabel = changes.label ?? rule.label
  const willBeActive = changes.isActive ?? rule.isActive
  const labelChanged = changes.label !== undefined && changes.label !== rule.label
  if (willBeActive && (labelChanged || (changes.isActive === true && !rule.isActive))) {
    await assertLabelAvailable(nextLabel, rule._id)
  }

  const type = changes.type ?? pointsType(rule.points)
  const magnitude = changes.points ?? Math.abs(rule.points)

  rule.label = nextLabel
  rule.points = toSignedPoints(type, magnitude)
  if (changes.category !== undefined) rule.category = changes.category
  if (changes.icon !== undefined) rule.icon = changes.icon
  if (changes.isActive !== undefined) rule.isActive = changes.isActive
  await rule.save()

  return toRule(rule)
}

/** Soft delete: hidden from the picker, history untouched. */
export async function archiveRule(id) {
  const rule = await findRuleOrThrow(id)
  if (rule.isActive) {
    rule.isActive = false
    await rule.save()
  }
  return toRule(rule)
}
