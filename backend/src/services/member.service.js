import { AVATAR_COLORS, ROLES } from '../config/constants.js'
import User from '../models/User.js'
import { emitLeaderboardUpdated } from '../sockets/index.js'
import { ApiError } from '../utils/ApiError.js'
import { toAdminMember } from '../utils/serializers.js'

/** Teammates have no account — just a name, designation and avatar colour. */
const EDITABLE_FIELDS = ['name', 'designation', 'avatarColor']

async function findMemberOrThrow(id) {
  // Only members are managed here — the admin account can't be edited or
  // deactivated through these endpoints.
  const member = await User.findOne({ _id: id, role: ROLES.MEMBER })
  if (!member) throw ApiError.notFound('That member was not found.', 'MEMBER_NOT_FOUND')
  return member
}

/** The least-used palette colour among active members, so avatars stay distinct. */
async function pickAvatarColor() {
  const usage = await User.aggregate([
    { $match: { role: ROLES.MEMBER, isActive: true } },
    { $group: { _id: '$avatarColor', count: { $sum: 1 } } },
  ])
  const counts = new Map(usage.map(({ _id, count }) => [_id, count]))
  return AVATAR_COLORS.reduce((best, color) =>
    (counts.get(color) ?? 0) < (counts.get(best) ?? 0) ? color : best
  )
}

export async function listMembers({ status = 'all' } = {}) {
  const filter = { role: ROLES.MEMBER }
  if (status === 'active') filter.isActive = true
  if (status === 'inactive') filter.isActive = false

  const members = await User.find(filter)
    .collation({ locale: 'en', strength: 2 })
    .sort({ isActive: -1, name: 1 })
    .lean()

  return members.map(toAdminMember)
}

export async function createMember({ name, designation, avatarColor }) {
  const member = await User.create({
    name,
    designation,
    role: ROLES.MEMBER,
    avatarColor: avatarColor ?? (await pickAvatarColor()),
  })

  emitLeaderboardUpdated('member')
  return toAdminMember(member)
}

export async function updateMember(id, changes) {
  const member = await findMemberOrThrow(id)
  for (const field of EDITABLE_FIELDS) {
    if (changes[field] !== undefined) member[field] = changes[field]
  }
  await member.save()

  emitLeaderboardUpdated('member')
  return toAdminMember(member)
}

export async function setMemberStatus(id, isActive) {
  const member = await findMemberOrThrow(id)
  if (member.isActive === isActive) return toAdminMember(member)

  member.isActive = isActive
  await member.save()

  emitLeaderboardUpdated('member')
  return toAdminMember(member)
}
