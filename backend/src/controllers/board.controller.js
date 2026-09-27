import { getMemberHistory, getRecentActivity } from '../services/activity.service.js'
import { getLeaderboard } from '../services/leaderboard.service.js'
import { sendOk } from '../utils/respond.js'

export async function leaderboard(req, res) {
  sendOk(res, await getLeaderboard({ period: req.valid.query.period }))
}

export async function activity(req, res) {
  sendOk(res, { items: await getRecentActivity({ limit: req.valid.query.limit }) })
}

export async function memberHistory(req, res) {
  sendOk(res, await getMemberHistory(req.valid.params.id, req.valid.query))
}
