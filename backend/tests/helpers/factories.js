import mongoose from 'mongoose'
import { ROLES } from '../../src/config/constants.js'
import PointEvent from '../../src/models/PointEvent.js'
import Rule from '../../src/models/Rule.js'
import User from '../../src/models/User.js'

export const TEST_PASSWORD = 'Password@123'

let sequence = 0

export async function createUser({ password = TEST_PASSWORD, ...fields } = {}) {
  sequence += 1
  const user = new User({
    name: `Person ${sequence}`,
    email: `person${sequence}@test.dev`,
    role: ROLES.MEMBER,
    designation: 'Developer',
    ...fields,
  })
  await user.setPassword(password)
  // setPassword stamps "now"; tests that backdate an account keep sessions valid.
  if (fields.createdAt) user.passwordChangedAt = fields.createdAt
  await user.save()
  return user
}

export const createAdmin = (fields = {}) => createUser({ role: ROLES.ADMIN, name: 'Admin', ...fields })

export function createRule(fields = {}) {
  return Rule.create({ label: 'Task completed', points: 10, category: 'Delivery', ...fields })
}

/** Inserts a ledger entry directly, e.g. backdated for period and trend tests. */
export function addEvent({ member, points, givenBy, label = 'Test entry', createdAt = new Date(), ...rest }) {
  return PointEvent.create({
    member: member._id ?? member,
    ruleLabel: label,
    points,
    givenBy: givenBy._id ?? givenBy,
    batchId: new mongoose.Types.ObjectId(),
    createdAt,
    ...rest,
  })
}

/** An ISO time in India Standard Time, e.g. at('2026-09-22 10:00'). */
export const at = (localDateTime) => new Date(`${localDateTime.replace(' ', 'T')}:00+05:30`)
