import { ROLES } from '../config/constants.js'
import { env } from '../config/env.js'
import PointEvent from '../models/PointEvent.js'
import User from '../models/User.js'
import { buildStandings, getWindows, listLevels } from './gamification.js'

const EMPTY_TOTALS = Object.freeze({
  allTimePoints: 0,
  points: 0,
  rewards: 0,
  penalties: 0,
  previousPoints: 0,
  recentRewards: 0,
  recentPenalties: 0,
})

const since = (start) => (start ? { $gte: ['$createdAt', start] } : true)
const sumPointsIf = (condition) => ({ $sum: { $cond: [condition, '$points', 0] } })
const countIf = (...conditions) => ({ $sum: { $cond: [{ $and: conditions }, 1, 0] } })
const IS_REWARD = { $gt: ['$points', 0] }
const IS_PENALTY = { $lt: ['$points', 0] }

/**
 * Every total the leaderboard needs, in ONE pass over the ledger:
 * match non-voided events → group by member → conditional sums.
 *
 * The period is applied inside the sums rather than in $match because levels
 * are always based on all-time points, even when the board shows "This week".
 *
 * @returns {Promise<Map<string, typeof EMPTY_TOTALS>>} keyed by member id
 */
export async function aggregateMemberTotals(memberIds, windows) {
  const inCurrent = since(windows.current.start)
  const inPrevious = {
    $and: [since(windows.previous.start), { $lt: ['$createdAt', windows.previous.end] }],
  }
  const inRecent = since(windows.fireSince)

  const groups = await PointEvent.aggregate([
    {
      $match: {
        isVoided: false,
        member: { $in: memberIds },
        createdAt: { $lte: windows.current.end },
      },
    },
    {
      $group: {
        _id: '$member',
        allTimePoints: { $sum: '$points' },
        points: sumPointsIf(inCurrent),
        rewards: countIf(inCurrent, IS_REWARD),
        penalties: countIf(inCurrent, IS_PENALTY),
        previousPoints: sumPointsIf(inPrevious),
        recentRewards: countIf(inRecent, IS_REWARD),
        recentPenalties: countIf(inRecent, IS_PENALTY),
      },
    },
  ])

  return new Map(groups.map(({ _id, ...totals }) => [String(_id), totals]))
}

/**
 * Ranked standings for active members. The admin is not ranked.
 *
 * @param {{ period?: 'all'|'month'|'week', now?: Date, timezone?: string }} options
 */
export async function getLeaderboard({ period = 'all', now = new Date(), timezone = env.timezone } = {}) {
  const windows = getWindows(period, now, timezone)

  const members = await User.find({ role: ROLES.MEMBER, isActive: true })
    .select('name designation avatarColor createdAt')
    .lean()

  const totals = members.length
    ? await aggregateMemberTotals(members.map((member) => member._id), windows)
    : new Map()

  const entries = members.map((member) => ({
    member: {
      id: String(member._id),
      name: member.name,
      designation: member.designation ?? '',
      avatarColor: member.avatarColor,
      createdAt: member.createdAt,
    },
    ...(totals.get(String(member._id)) ?? EMPTY_TOTALS),
  }))

  return {
    period,
    timezone,
    range: { from: windows.current.start, to: now },
    generatedAt: now,
    levels: listLevels(),
    rows: buildStandings(entries, { previousEnd: windows.previous.end }),
  }
}
