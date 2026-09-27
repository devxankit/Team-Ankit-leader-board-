import { Server } from 'socket.io'
import { env } from '../config/env.js'
import { isAllowedOrigin } from '../utils/origin.js'

export const LEADERBOARD_UPDATED = 'leaderboard:updated'

/** @type {Server | null} */
let io = null

/**
 * Attaches Socket.io to the HTTP server. The leaderboard is public, so anyone
 * viewing it may connect; only our own site (or CLIENT_URL) may open a socket.
 */
export function initSockets(httpServer) {
  io = new Server(httpServer, {
    serveClient: false,
    cors: { origin: env.clientUrls, credentials: true },
    allowRequest: (req, callback) => callback(null, isAllowedOrigin(req.headers.origin, req.headers.host)),
  })
  return io
}

/**
 * Tells every open leaderboard that scores or standings changed. Clients
 * refetch whatever view they're on — people may have different period filters
 * open, so the event carries no leaderboard data. A no-op when sockets aren't
 * running (tests, seed scripts).
 *
 * @param {'points'|'void'|'member'} reason
 */
export function emitLeaderboardUpdated(reason) {
  io?.emit(LEADERBOARD_UPDATED, { reason, at: new Date().toISOString() })
}

export async function closeSockets() {
  if (!io) return
  await io.close()
  io = null
}
