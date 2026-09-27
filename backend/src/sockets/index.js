import cookieParser from 'cookie-parser'
import { Server } from 'socket.io'
import { SESSION_COOKIE } from '../config/constants.js'
import { env } from '../config/env.js'
import { authenticateToken } from '../services/auth.service.js'
import { isAllowedOrigin } from '../utils/origin.js'

export const LEADERBOARD_UPDATED = 'leaderboard:updated'

/** @type {Server | null} */
let io = null

const userRoom = (userId) => `user:${userId}`

/**
 * Attaches Socket.io to the HTTP server. Connections authenticate with the same
 * httpOnly session cookie as the REST API, so only signed-in users get live
 * updates.
 */
export function initSockets(httpServer) {
  io = new Server(httpServer, {
    serveClient: false,
    cors: { origin: env.clientUrls, credentials: true },
    allowRequest: (req, callback) => callback(null, isAllowedOrigin(req.headers.origin, req.headers.host)),
  })

  io.engine.use(cookieParser())

  io.use(async (socket, next) => {
    try {
      const token = socket.request.cookies?.[SESSION_COOKIE]
      if (!token) return next(new Error('UNAUTHENTICATED'))

      const user = await authenticateToken(token)
      if (user.mustChangePassword) return next(new Error('PASSWORD_CHANGE_REQUIRED'))

      socket.data.userId = String(user._id)
      next()
    } catch (error) {
      next(new Error(error.code ?? 'UNAUTHENTICATED'))
    }
  })

  io.on('connection', (socket) => {
    socket.join(userRoom(socket.data.userId))
  })

  return io
}

/**
 * Tells every connected client that scores or standings changed. Clients
 * refetch whatever view they're on — people may have different period filters
 * open, so the event carries no leaderboard data. A no-op when sockets aren't
 * running (tests, seed scripts).
 *
 * @param {'points'|'void'|'member'} reason
 */
export function emitLeaderboardUpdated(reason) {
  io?.emit(LEADERBOARD_UPDATED, { reason, at: new Date().toISOString() })
}

/** Drops a user's live connections, e.g. after deactivation or a password reset. */
export function disconnectUser(userId) {
  io?.in(userRoom(String(userId))).disconnectSockets(true)
}

export async function closeSockets() {
  if (!io) return
  await io.close()
  io = null
}
