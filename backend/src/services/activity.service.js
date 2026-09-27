import { ROLES } from '../config/constants.js'
import { FEED } from '../config/gamification.js'
import PointEvent from '../models/PointEvent.js'
import User from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { toPublicEvent, toPublicMember } from '../utils/serializers.js'

/**
 * Member-facing views show only live (non-voided) entries of active members —
 * a reversed mistake leaves no public trace. The admin log shows everything.
 */

/** Latest entries across the team, newest first. */
export async function getRecentActivity({ limit = FEED.defaultLimit } = {}) {
  const activeMemberIds = await User.find({ role: ROLES.MEMBER, isActive: true }).distinct('_id')

  const events = await PointEvent.find({ isVoided: false, member: { $in: activeMemberIds } })
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .populate('member', 'name designation avatarColor')
    .lean()

  return events.map(toPublicEvent)
}

/** One member's history, newest first, paginated. */
export async function getMemberHistory(memberId, { page = 1, limit = 20 } = {}) {
  const member = await User.findOne({ _id: memberId, role: ROLES.MEMBER, isActive: true })
    .select('name designation avatarColor')
    .lean()
  if (!member) throw ApiError.notFound('That member was not found.', 'MEMBER_NOT_FOUND')

  const filter = { member: member._id, isVoided: false }
  const [events, total] = await Promise.all([
    PointEvent.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    PointEvent.countDocuments(filter),
  ])

  return {
    member: toPublicMember(member),
    items: events.map((event) => toPublicEvent({ ...event, member })),
    page,
    limit,
    total,
    hasMore: page * limit < total,
  }
}
