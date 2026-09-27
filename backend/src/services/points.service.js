import mongoose from 'mongoose'
import { DateTime } from 'luxon'
import { ROLES } from '../config/constants.js'
import { env } from '../config/env.js'
import PointEvent from '../models/PointEvent.js'
import Rule from '../models/Rule.js'
import User from '../models/User.js'
import { emitLeaderboardUpdated } from '../sockets/index.js'
import { ApiError } from '../utils/ApiError.js'
import { toAdminEvent } from '../utils/serializers.js'

/**
 * Gives or takes points: one ledger event per selected member, inserted in bulk.
 * Pass either `ruleId` or `custom: { label, points }` (a one-off without a rule).
 */
export async function applyPoints({ memberIds, ruleId, custom, note = '', adminId }) {
  const uniqueIds = [...new Set(memberIds.map(String))]

  const members = await User.find({ _id: { $in: uniqueIds }, role: ROLES.MEMBER, isActive: true })
    .select('name')
    .lean()
  if (members.length !== uniqueIds.length) {
    throw ApiError.conflict(
      'Some selected people are no longer active members. Refresh the list and try again.',
      { code: 'MEMBERS_UNAVAILABLE' }
    )
  }

  let entry
  if (ruleId) {
    const rule = await Rule.findOne({ _id: ruleId, isActive: true }).lean()
    if (!rule) {
      throw ApiError.conflict('That rule was archived or deleted. Pick another one.', {
        code: 'RULE_UNAVAILABLE',
      })
    }
    entry = { rule: rule._id, ruleLabel: rule.label, points: rule.points }
  } else {
    entry = { rule: null, ruleLabel: custom.label, points: custom.points }
  }

  const batchId = new mongoose.Types.ObjectId()
  await PointEvent.insertMany(
    members.map((member) => ({ ...entry, member: member._id, note, givenBy: adminId, batchId }))
  )

  emitLeaderboardUpdated('points')

  return {
    count: members.length,
    label: entry.ruleLabel,
    points: entry.points,
    batchId: String(batchId),
    members: members.map((member) => ({ id: String(member._id), name: member.name })),
  }
}

/**
 * Reverses a mistaken entry. The event stays in the ledger (marked voided) for
 * the audit trail; every total skips it, so scores correct themselves.
 */
export async function voidEvent(eventId, adminId) {
  // Conditional update: two admins clicking "Reverse" at once can't both win.
  const event = await PointEvent.findOneAndUpdate(
    { _id: eventId, isVoided: false },
    { $set: { isVoided: true, voidedBy: adminId, voidedAt: new Date() } },
    { returnDocument: 'after' }
  )
    .populate('member', 'name designation avatarColor isActive')
    .populate('givenBy', 'name')
    .populate('voidedBy', 'name')
    .lean()

  if (!event) {
    const exists = await PointEvent.exists({ _id: eventId })
    throw exists
      ? ApiError.conflict('This entry was already reversed.', { code: 'ALREADY_VOIDED' })
      : ApiError.notFound('That entry was not found.', 'EVENT_NOT_FOUND')
  }

  emitLeaderboardUpdated('void')
  return toAdminEvent(event)
}

/** Calendar days (YYYY-MM-DD) are interpreted in the app timezone. */
const dayBoundary = (isoDate, edge) =>
  DateTime.fromISO(isoDate, { zone: env.timezone })[edge === 'start' ? 'startOf' : 'endOf']('day').toJSDate()

/** Admin activity log: every event, voided ones included, newest first. */
export async function listEvents({ member, rule, type, status = 'all', from, to, page = 1, limit = 25 }) {
  const filter = {}
  if (member) filter.member = member
  if (rule === 'custom') filter.rule = null
  else if (rule) filter.rule = rule
  if (type === 'reward') filter.points = { $gt: 0 }
  if (type === 'penalty') filter.points = { $lt: 0 }
  if (status === 'active') filter.isVoided = false
  if (status === 'voided') filter.isVoided = true
  if (from || to) {
    filter.createdAt = {
      ...(from ? { $gte: dayBoundary(from, 'start') } : {}),
      ...(to ? { $lte: dayBoundary(to, 'end') } : {}),
    }
  }

  const [events, total] = await Promise.all([
    PointEvent.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('member', 'name designation avatarColor isActive')
      .populate('givenBy', 'name')
      .populate('voidedBy', 'name')
      .lean(),
    PointEvent.countDocuments(filter),
  ])

  return {
    items: events.map(toAdminEvent),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}
