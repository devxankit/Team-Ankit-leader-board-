import { Router } from 'express'
import * as board from '../controllers/board.controller.js'
import { validate } from '../middleware/validate.js'
import { activityQuery, historyQuery, leaderboardQuery } from '../validation/board.schemas.js'
import { idParams } from '../validation/common.js'

/** Read-only views for every signed-in user (mounted behind requireAuth). */
const router = Router()

router.get('/leaderboard', validate({ query: leaderboardQuery }), board.leaderboard)
router.get('/activity', validate({ query: activityQuery }), board.activity)
router.get('/members/:id/history', validate({ params: idParams, query: historyQuery }), board.memberHistory)

export default router
