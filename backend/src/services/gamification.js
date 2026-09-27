import { DateTime } from 'luxon'
import { LEVELS, ON_FIRE, TREND } from '../config/gamification.js'

/**
 * Game rules as pure functions — no database, no clock, no I/O — so they are
 * trivial to unit-test and extend (achievements, monthly champion, streaks…).
 * Tunable numbers live in config/gamification.js.
 */

const ORDERED_LEVELS = [...LEVELS].sort((a, b) => a.min - b.min)

const finiteOrNull = (value) => (Number.isFinite(value) ? value : null)
const clamp01 = (value) => Math.min(1, Math.max(0, value))

/** JSON-safe copy of the level table (the open-ended bottom level has min: null). */
export function listLevels() {
  return ORDERED_LEVELS.map(({ key, name, min }) => ({ key, name, min: finiteOrNull(min) }))
}

/**
 * Level for an all-time point total, plus progress towards the next one.
 * `progress` is 0–1; the open-ended bottom level reports 0 because there is no
 * meaningful floor to measure from.
 */
export function getLevel(allTimePoints) {
  let index = 0
  ORDERED_LEVELS.forEach((level, i) => {
    if (allTimePoints >= level.min) index = i
  })

  const level = ORDERED_LEVELS[index]
  const next = ORDERED_LEVELS[index + 1] ?? null
  const base = { key: level.key, name: level.name, min: finiteOrNull(level.min) }

  if (!next) return { ...base, next: null, pointsToNext: 0, progress: 1 }

  const progress = Number.isFinite(level.min)
    ? (allTimePoints - level.min) / (next.min - level.min)
    : 0

  return {
    ...base,
    next: { key: next.key, name: next.name, min: next.min },
    pointsToNext: next.min - allTimePoints,
    progress: Math.round(clamp01(progress) * 1000) / 1000,
  }
}

/**
 * Start of the period containing `at`, in `timezone`. Weeks are ISO weeks, so
 * they start on Monday at 00:00. Returns null for all-time.
 */
export function getPeriodStart(period, at, timezone) {
  if (period === 'all') return null
  const unit = period === 'week' ? 'week' : 'month'
  return DateTime.fromJSDate(at, { zone: timezone }).startOf(unit).toJSDate()
}

/**
 * The time windows one leaderboard needs:
 *  - current:   the selected period up to now
 *  - previous:  the same period definition, evaluated `TREND.lookbackDays` ago —
 *               i.e. exactly what the board would have shown back then
 *  - fireSince: start of the rolling 🔥 window
 */
export function getWindows(period, now, timezone) {
  const zonedNow = DateTime.fromJSDate(now, { zone: timezone })
  const then = zonedNow.minus({ days: TREND.lookbackDays }).toJSDate()

  return {
    current: { start: getPeriodStart(period, now, timezone), end: now },
    previous: { start: getPeriodStart(period, then, timezone), end: then },
    fireSince: zonedNow.minus({ days: ON_FIRE.windowDays }).toJSDate(),
  }
}

const compareNames = (a, b) =>
  a.localeCompare(b, 'en', { sensitivity: 'base' })

/**
 * Standard competition ranking ("1, 2, 2, 4"): equal scores share a rank and
 * the following rank skips. Display order is score (high → low), then name,
 * then id so the order is stable.
 *
 * @template T
 * @param {T[]} items
 * @param {{ score: (item: T) => number, name: (item: T) => string, id: (item: T) => string }} accessors
 * @returns {{ item: T, rank: number }[]}
 */
export function rankItems(items, { score, name, id }) {
  const sorted = [...items].sort(
    (a, b) => score(b) - score(a) || compareNames(name(a), name(b)) || id(a).localeCompare(id(b))
  )

  let rank = 0
  return sorted.map((item, index) => {
    if (index === 0 || score(item) !== score(sorted[index - 1])) rank = index + 1
    return { item, rank }
  })
}

/** Positive = moved up (▲), negative = moved down (▼), 0 = no change, null = new on the board. */
export function getTrend(rank, previousRank) {
  return previousRank == null ? null : previousRank - rank
}

export function isOnFire({ rewards, penalties }) {
  return rewards >= ON_FIRE.minRewards && penalties <= ON_FIRE.maxPenalties
}

/**
 * Turns per-member totals into ranked leaderboard rows.
 *
 * @param {Array<{
 *   member: { id: string, name: string, designation: string, avatarColor: string, createdAt: Date },
 *   points: number, rewards: number, penalties: number, allTimePoints: number,
 *   previousPoints: number, recentRewards: number, recentPenalties: number
 * }>} entries
 * @param {{ previousEnd: Date }} options - members who joined after this weren't on the board back then
 */
export function buildStandings(entries, { previousEnd }) {
  const accessors = (scoreKey) => ({
    score: (entry) => entry[scoreKey],
    name: (entry) => entry.member.name,
    id: (entry) => entry.member.id,
  })

  const existedBefore = entries.filter((entry) => new Date(entry.member.createdAt) <= previousEnd)
  const previousRanks = new Map(
    rankItems(existedBefore, accessors('previousPoints')).map(({ item, rank }) => [item.member.id, rank])
  )

  return rankItems(entries, accessors('points')).map(({ item, rank }) => {
    const previousRank = previousRanks.get(item.member.id) ?? null
    const { id, name, designation, avatarColor } = item.member

    return {
      member: { id, name, designation, avatarColor },
      rank,
      previousRank,
      trend: getTrend(rank, previousRank),
      points: item.points,
      rewards: item.rewards,
      penalties: item.penalties,
      allTimePoints: item.allTimePoints,
      level: getLevel(item.allTimePoints),
      onFire: isOnFire({ rewards: item.recentRewards, penalties: item.recentPenalties }),
    }
  })
}
