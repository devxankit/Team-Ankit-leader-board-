import { z } from 'zod'
import { PERIODS } from '../config/constants.js'
import { FEED } from '../config/gamification.js'
import { blankAsMissing, limitParam, pageParam } from './common.js'

export const leaderboardQuery = z.object({
  period: blankAsMissing(z.enum(PERIODS, { error: 'Period must be all, month or week' }).default('all')),
})

export const activityQuery = z.object({
  limit: limitParam(FEED.maxLimit, FEED.defaultLimit),
})

export const historyQuery = z.object({
  page: pageParam,
  limit: limitParam(50, 20),
})
