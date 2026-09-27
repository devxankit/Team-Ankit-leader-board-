import { AVATAR_COLORS, ROLES } from '../config/constants.js'
import User from '../models/User.js'
import { disconnectUser, emitLeaderboardUpdated } from '../sockets/index.js'
import { ApiError } from '../utils/ApiError.js'
import { toAdminMember } from '../utils/serializers.js'

const EDITABLE_FIELDS = ['name', 'email', 'designation', 'avatarColor']

async function findMemberOrThrow(id) {
  // Only members are managed here — the admin account can't be edited,
  // deactivated or reset through these endpoints.
  const member = await User.findOne({ _id: id, role: ROLES.MEMBER })
  if (!member) throw ApiError.notFound('That member was not found.', 'MEMBER_NOT_FOUND')
  return member
}

async function assertEmailAvailable(email, exceptId) {
  const filter = { email, ...(exceptId ? { _id: { $ne: exceptId } } : {}) }
  if (await User.exists(filter)) {
    throw ApiError.conflict('Someone already uses that email.', {
      code: 'EMAIL_TAKEN',
      fieldErrors: { email: 'Someone already uses that email.' },
    })
  }
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

/** New members start on the admin's temporary password and must change it at first sign-in. */
export async function createMember({ name, email, designation, password, avatarColor }) {
  await assertEmailAvailable(email)

  const member = new User({
    name,
    email,
    designation,
    role: ROLES.MEMBER,
    avatarColor: avatarColor ?? (await pickAvatarColor()),
    mustChangePassword: true,
  })
  await member.setPassword(password)
  await member.save()

  emitLeaderboardUpdated('member')
  return toAdminMember(member)
}

export async function updateMember(id, changes) {
  const member = await findMemberOrThrow(id)

  if (changes.email && changes.email !== member.email) {
    await assertEmailAvailable(changes.email, member._id)
  }
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

  if (!isActive) disconnectUser(member._id)
  emitLeaderboardUpdated('member')
  return toAdminMember(member)
}

/** Sets a new temporary password; the member's existing sessions stop working at once. */
export async function resetMemberPassword(id, password) {
  const member = await findMemberOrThrow(id)

  await member.setPassword(password)
  member.mustChangePassword = true
  await member.save()

  disconnectUser(member._id)
  return toAdminMember(member)
}
