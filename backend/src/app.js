import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { env, isProduction, isTest } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import routes from './routes/index.js'
import { ApiError } from './utils/ApiError.js'
import { isAllowedOrigin } from './utils/origin.js'

const app = express()

// express-rate-limit keys on client IP, which needs the real proxy hop count.
app.set('trust proxy', env.trustProxy)
app.disable('x-powered-by')

const socketOrigins = env.clientUrls.map((url) => url.replace(/^http/, 'ws'))
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        // Socket.io upgrades to a websocket on the same host.
        connectSrc: ["'self'", ...socketOrigins],
      },
    },
  })
)

// Rejecting unknown origins here (not just in preflights) is the CSRF guard.
app.use(
  cors((req, callback) => {
    if (isAllowedOrigin(req.header('Origin'), req.headers.host)) {
      callback(null, { origin: true, credentials: true })
    } else {
      callback(ApiError.forbidden('This site is not allowed to call the API.', 'ORIGIN_NOT_ALLOWED'))
    }
  })
)

app.use(compression())
app.use(express.json({ limit: '50kb' }))
app.use(cookieParser())
if (!isTest) app.use(morgan(isProduction ? 'combined' : 'dev'))

app.use('/api', apiLimiter, routes)

// Production: serve the built frontend so pages, API and sockets share one origin.
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist')
if (env.serveClient && fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist, { index: false, maxAge: '1h' }))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/socket.io')) return next()
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.use(errorHandler)

export default app
