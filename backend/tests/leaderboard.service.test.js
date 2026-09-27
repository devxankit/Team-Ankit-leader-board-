import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getLeaderboard } from '../src/services/leaderboard.service.js'
import { connectTestDb, disconnectTestDb } from './helpers/db.js'
import { addEvent, at, createAdmin, createUser } from './helpers/factories.js'

// "Now" is Thursday 24 Sep 2026, 12:00 IST. The week started Mon 21 Sep; the
// trend compares against Thu 17 Sep 12:00 (week of Mon 14 Sep).
const NOW = at('2026-09-24 12:00')
const board = (period) => getLeaderboard({ period, now: NOW, timezone: 'Asia/Kolkata' })
const byName = (result) => Object.fromEntries(result.rows.map((row) => [row.member.name, row]))

beforeAll(async () => {
  await connectTestDb()
  const admin = await createAdmin()
  const joined = at('2026-08-01 10:00')
  const [asha, bala, dev, esha] = await Promise.all([
    createUser({ name: 'Asha', createdAt: joined }),
    createUser({ name: 'Bala', createdAt: joined }),
    createUser({ name: 'Dev', createdAt: at('2026-09-22 10:00') }), // joined 2 days ago → NEW
    createUser({ name: 'Esha', createdAt: joined, isActive: false }),
  ])
  await createUser({ name: 'Chitra', createdAt: joined }) // no points at all

  const give = (member, points, when, extra) => addEvent({ member, points, givenBy: admin, createdAt: at(when), ...extra })
  await Promise.all([
    give(asha, 50, '2026-08-20 11:00'),
    give(asha, -5, '2026-09-15 10:00'),
    give(asha, 10, '2026-09-22 10:00'),
    give(bala, 30, '2026-09-10 10:00'),
    give(bala, 10, '2026-09-23 10:00'),
    give(bala, 10, '2026-09-23 11:00', { isVoided: true }), // reversed mistake
    give(dev, 15, '2026-09-23 10:00'),
    give(dev, 5, '2026-09-23 15:00'),
    give(dev, 5, '2026-09-24 10:00'),
    give(esha, 100, '2026-09-23 10:00'), // deactivated member
  ])
})

afterAll(disconnectTestDb)

describe('getLeaderboard', () => {
  it('sums the ledger per member, skipping voided entries and inactive members', async () => {
    const result = await board('all')
    expect(result.rows.map((row) => [row.member.name, row.points, row.rank])).toEqual([
      ['Asha', 55, 1],
      ['Bala', 40, 2],
      ['Dev', 25, 3],
      ['Chitra', 0, 4], // members without events still appear
    ])
  })

  it('filters by month and counts rewards and penalties for the period', async () => {
    const rows = byName(await board('month'))
    expect(rows.Bala).toMatchObject({ points: 40, rank: 1 })
    expect(rows.Dev).toMatchObject({ points: 25, rank: 2 })
    expect(rows.Asha).toMatchObject({ points: 5, rank: 3, rewards: 1, penalties: 1 })
  })

  it('starts the week on Monday and shares ranks on ties (1, 2, 2, 4)', async () => {
    const result = await board('week')
    expect(result.range.from).toEqual(at('2026-09-21 00:00'))
    expect(result.rows.map((row) => [row.member.name, row.points, row.rank])).toEqual([
      ['Dev', 25, 1],
      ['Asha', 10, 2],
      ['Bala', 10, 2],
      ['Chitra', 0, 4],
    ])
  })

  it('bases levels on all-time points even on the weekly board', async () => {
    const rows = byName(await board('week'))
    expect(rows.Asha).toMatchObject({ points: 10, allTimePoints: 55 })
    expect(rows.Asha.level).toMatchObject({ key: 'rookie', pointsToNext: 45 })
  })

  it('compares ranks with the same board 7 days ago', async () => {
    const allTime = byName(await board('all'))
    expect([allTime.Asha.trend, allTime.Bala.trend, allTime.Chitra.trend, allTime.Dev.trend]).toEqual([0, 0, -1, null])

    // Last week at the same moment: Bala 0, Chitra 0 (both #1), Asha −5 (#3).
    const week = byName(await board('week'))
    expect([week.Asha.trend, week.Bala.trend, week.Chitra.trend, week.Dev.trend]).toEqual([1, -1, -3, null])
  })

  it('marks 🔥 for 3+ rewards and no penalties in the last 7 days', async () => {
    const rows = byName(await board('all'))
    expect(rows.Dev.onFire).toBe(true)
    expect(rows.Asha.onFire).toBe(false)
    expect(rows.Bala.onFire).toBe(false)
  })

  it('never ranks the admin', async () => {
    const result = await board('all')
    expect(result.rows.some((row) => row.member.name === 'Admin')).toBe(false)
  })
})
