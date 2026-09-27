import { describe, expect, it } from 'vitest'
import {
  buildStandings,
  getLevel,
  getPeriodStart,
  getTrend,
  getWindows,
  isOnFire,
  listLevels,
  rankItems,
} from '../src/services/gamification.js'

const IST = 'Asia/Kolkata'
const at = (local) => new Date(`${local.replace(' ', 'T')}:00+05:30`)

describe('getLevel', () => {
  it.each([
    [-40, 'warning', 'rookie', 40, 0],
    [-1, 'warning', 'rookie', 1, 0],
    [0, 'rookie', 'bronze', 100, 0],
    [99, 'rookie', 'bronze', 1, 0.99],
    [100, 'bronze', 'silver', 150, 0],
    [310, 'silver', 'gold', 190, 0.24],
    [999, 'gold', 'diamond', 1, 0.998],
    [1000, 'diamond', 'legend', 1000, 0],
  ])('%i points → %s, %s next, %i to go', (points, key, nextKey, pointsToNext, progress) => {
    const level = getLevel(points)
    expect(level.key).toBe(key)
    expect(level.next.key).toBe(nextKey)
    expect(level.pointsToNext).toBe(pointsToNext)
    expect(level.progress).toBeCloseTo(progress, 3)
  })

  it('tops out at Legend with full progress', () => {
    for (const points of [2000, 9999]) {
      expect(getLevel(points)).toMatchObject({ key: 'legend', next: null, pointsToNext: 0, progress: 1 })
    }
  })

  it('exposes a JSON-safe level table', () => {
    const levels = listLevels()
    expect(levels[0]).toEqual({ key: 'warning', name: 'Warning', min: null })
    expect(levels.map((level) => level.min)).toEqual([null, 0, 100, 250, 500, 1000, 2000])
  })
})

describe('getPeriodStart', () => {
  it('returns null for all time', () => {
    expect(getPeriodStart('all', new Date(), IST)).toBeNull()
  })

  it('starts the week on Monday 00:00 in the app timezone', () => {
    expect(getPeriodStart('week', at('2026-09-24 15:00'), IST)).toEqual(at('2026-09-21 00:00'))
    // Late Sunday night still belongs to the week that began on Monday…
    expect(getPeriodStart('week', at('2026-09-27 23:30'), IST)).toEqual(at('2026-09-21 00:00'))
    // …and just after midnight IST it's a new week, although UTC still says Sunday.
    expect(getPeriodStart('week', at('2026-09-28 00:10'), IST)).toEqual(at('2026-09-28 00:00'))
  })

  it('starts the month on the 1st at 00:00 in the app timezone', () => {
    expect(getPeriodStart('month', at('2026-10-01 01:00'), IST)).toEqual(at('2026-10-01 00:00'))
    expect(getPeriodStart('month', at('2026-09-30 23:59'), IST)).toEqual(at('2026-09-01 00:00'))
  })
})

describe('getWindows', () => {
  it('compares against the same period as it stood 7 days ago', () => {
    const windows = getWindows('week', at('2026-09-24 12:00'), IST)
    expect(windows.current.start).toEqual(at('2026-09-21 00:00'))
    expect(windows.previous).toEqual({ start: at('2026-09-14 00:00'), end: at('2026-09-17 12:00') })
    expect(windows.fireSince).toEqual(at('2026-09-17 12:00'))
  })
})

describe('rankItems', () => {
  const people = [
    { id: 'd', name: 'Dia', score: 10 },
    { id: 'c', name: 'charu', score: 30 },
    { id: 'a', name: 'Aman', score: 50 },
    { id: 'b', name: 'Bela', score: 30 },
  ]
  const ranked = rankItems(people, { score: (p) => p.score, name: (p) => p.name, id: (p) => p.id })

  it('gives tied scores the same rank and skips the next one (1, 2, 2, 4)', () => {
    expect(ranked.map(({ rank }) => rank)).toEqual([1, 2, 2, 4])
  })

  it('orders ties by name, ignoring case', () => {
    expect(ranked.map(({ item }) => item.name)).toEqual(['Aman', 'Bela', 'charu', 'Dia'])
  })
})

describe('getTrend and isOnFire', () => {
  it('reports rank movement', () => {
    expect(getTrend(1, 3)).toBe(2)
    expect(getTrend(4, 2)).toBe(-2)
    expect(getTrend(2, 2)).toBe(0)
    expect(getTrend(1, null)).toBeNull()
  })

  it('needs 3+ rewards and no penalties', () => {
    expect(isOnFire({ rewards: 3, penalties: 0 })).toBe(true)
    expect(isOnFire({ rewards: 2, penalties: 0 })).toBe(false)
    expect(isOnFire({ rewards: 6, penalties: 1 })).toBe(false)
  })
})

describe('buildStandings', () => {
  const entry = (id, name, { joined = '2026-08-01 10:00', ...totals }) => ({
    member: { id, name, designation: '', avatarColor: '#000', createdAt: at(joined) },
    points: 0,
    rewards: 0,
    penalties: 0,
    allTimePoints: 0,
    previousPoints: 0,
    recentRewards: 0,
    recentPenalties: 0,
    ...totals,
  })

  it('ranks, computes trend, level and 🔥, and flags newcomers', () => {
    const rows = buildStandings(
      [
        entry('1', 'Asha', { points: 40, allTimePoints: 40, previousPoints: 5 }),
        entry('2', 'Bala', { points: 60, allTimePoints: 260, previousPoints: 50, recentRewards: 3 }),
        entry('3', 'Chitra', { points: 70, allTimePoints: 70, joined: '2026-09-23 10:00' }),
      ],
      { previousEnd: at('2026-09-17 12:00') }
    )

    expect(rows.map((row) => [row.member.name, row.rank, row.trend])).toEqual([
      ['Chitra', 1, null], // joined after the comparison point → NEW
      ['Bala', 2, -1], // was #1 a week ago
      ['Asha', 3, -1], // was #2 a week ago
    ])
    expect(rows[1].level.key).toBe('silver')
    expect(rows[1].onFire).toBe(true)
    expect(rows[0]).not.toHaveProperty('member.createdAt')
  })
})
