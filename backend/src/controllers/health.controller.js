import { isDbConnected } from '../config/db.js'
import { sendOk } from '../utils/respond.js'

export function health(req, res) {
  sendOk(res, {
    status: 'ok',
    database: isDbConnected() ? 'connected' : 'disconnected',
    uptimeSeconds: Math.round(process.uptime()),
  })
}
