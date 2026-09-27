import mongoose from 'mongoose'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import PointEvent from '../src/models/PointEvent.js'
import { getLeaderboard } from '../src/services/leaderboard.service.js'
import { setMemberStatus } from '../src/services/member.service.js'
import { applyPoints, voidEvent } from '../src/services/points.service.js'
import { archiveRule, updateRule } from '../src/services/rule.service.js'
import { clearTestDb, connectTestDb, disconnectTestDb } from './helpers/db.js'
import { createAdmin, createRule, createUser } from './helpers/factories.js'

let admin
let asha
let bala
let rule

const scoreOf = async (member) => {
  const { rows } = await getLeaderboard({ period: 'all' })
  return rows.find((row) => row.member.id === String(member._id)).points
}

beforeAll(connectTestDb)
afterAll(disconnectTestDb)

beforeEach(async () => {
  await clearTestDb()
  admin = await createAdmin()
  asha = await createUser({ name: 'Asha' })
  bala = await createUser({ name: 'Bala' })
  rule = await createRule({ label: 'Task completed', points: 10 })
})

describe('applyPoints', () => {
  it('creates one ledger event per member with a snapshot and a shared batch id', async () => {
    const result = await applyPoints({
      memberIds: [String(asha._id), String(bala._id)],
      ruleId: String(rule._id),
      note: 'Great sprint',
      adminId: admin._id,
    })

    expect(result).toMatchObject({ count: 2, points: 10, label: 'Task completed' })
    const events = await PointEvent.find().lean()
    expect(events).toHaveLength(2)
    for (const event of events) {
      expect(event).toMatchObject({ ruleLabel: 'Task completed', points: 10, note: 'Great sprint', isVoided: false })
      expect(String(event.givenBy)).toBe(String(admin._id))
    }
    expect(new Set(events.map((event) => String(event.batchId))).size).toBe(1)
  })

  it('keeps past entries unchanged when the rule is edited later', async () => {
    await applyPoints({ memberIds: [String(asha._id)], ruleId: String(rule._id), adminId: admin._id })
    await updateRule(String(rule._id), { label: 'Task shipped', points: 25 })

    const [event] = await PointEvent.find().lean()
    expect(event).toMatchObject({ ruleLabel: 'Task completed', points: 10 })
    expect(await scoreOf(asha)).toBe(10)
  })

  it('records a custom one-off entry without a rule', async () => {
    await applyPoints({ memberIds: [String(asha._id)], custom: { label: 'Broke the build', points: -7 }, adminId: admin._id })
    const [event] = await PointEvent.find().lean()
    expect(event).toMatchObject({ rule: null, ruleLabel: 'Broke the build', points: -7 })
    expect(await scoreOf(asha)).toBe(-7)
  })

  it('writes nothing when a selected member is inactive or the rule is archived', async () => {
    await setMemberStatus(String(bala._id), false)
    await expect(
      applyPoints({ memberIds: [String(asha._id), String(bala._id)], ruleId: String(rule._id), adminId: admin._id })
    ).rejects.toMatchObject({ statusCode: 409, code: 'MEMBERS_UNAVAILABLE' })

    await archiveRule(String(rule._id))
    await expect(
      applyPoints({ memberIds: [String(asha._id)], ruleId: String(rule._id), adminId: admin._id })
    ).rejects.toMatchObject({ statusCode: 409, code: 'RULE_UNAVAILABLE' })

    expect(await PointEvent.countDocuments()).toBe(0)
  })
})

describe('voidEvent', () => {
  it('reverses an entry so the score corrects itself, keeping it for the audit trail', async () => {
    await applyPoints({ memberIds: [String(asha._id)], ruleId: String(rule._id), adminId: admin._id })
    await applyPoints({ memberIds: [String(asha._id)], custom: { label: 'Late', points: -5 }, adminId: admin._id })
    expect(await scoreOf(asha)).toBe(5)

    const reward = await PointEvent.findOne({ points: 10 })
    const voided = await voidEvent(String(reward._id), admin._id)

    expect(voided).toMatchObject({ isVoided: true, voidedBy: { id: String(admin._id) } })
    expect(voided.voidedAt).toBeInstanceOf(Date)
    expect(await scoreOf(asha)).toBe(-5)
    expect(await PointEvent.countDocuments()).toBe(2)
  })

  it('refuses to reverse the same entry twice, and 404s unknown ids', async () => {
    await applyPoints({ memberIds: [String(asha._id)], ruleId: String(rule._id), adminId: admin._id })
    const event = await PointEvent.findOne()

    await voidEvent(String(event._id), admin._id)
    await expect(voidEvent(String(event._id), admin._id)).rejects.toMatchObject({ statusCode: 409, code: 'ALREADY_VOIDED' })
    await expect(voidEvent(String(new mongoose.Types.ObjectId()), admin._id)).rejects.toMatchObject({ statusCode: 404 })
  })
})
