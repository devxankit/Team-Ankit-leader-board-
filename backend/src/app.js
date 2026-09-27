import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'

import { env, isProduction } from './config/env.js'
import routes from './routes/index.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'
import { ApiError } from './utils/ApiError.js'

const app = express()

/**
 * Proxy hop count. express-rate-limit derives the client IP from this, and
 * rejects a blanket `true` because it would let any caller spoof
 * X-Forwarded-For and slip the limiter. Set TRUST_PROXY to the real number of
 * proxies in front of the app when deploying behind nginx/a load balancer.
 */
app.set('trust proxy', env.trustProxy)
app.disable('x-powered-by')

// --- Security & core middleware ---
app.use(helmet())
app.use(
  cors({
    // Allow the configured site origins, plus tools with no Origin header
    // (curl, health checks, server-to-server).
    origin(origin, callback) {
      if (!origin || env.clientUrls.includes(origin)) {
        callback(null, true)
        return
      }
      // An ApiError (not a bare Error) so this surfaces as a 403 rather than
      // being logged as an unhandled 500 server fault.
      callback(new ApiError(403, 'Origin not allowed', { code: 'CORS_REJECTED' }))
    },
    credentials: true,
  })
)
app.use(compression())
// Form payloads are small; a tight cap keeps oversized JSON from reaching the
// parser. Resume uploads bypass this — multer handles multipart separately.
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }))
app.use(cookieParser())
app.use(morgan(isProduction ? 'combined' : 'dev'))

app.use('/uploads', express.static('public/uploads'))

// --- Routes ---
app.get('/', (req, res) => {
  res.json({ message: 'API server is running' })
})
app.use('/api', apiLimiter, routes)

// --- Error handling (must be last) ---
app.use(notFound)
app.use(errorHandler)

export default app
