import app from './app.js'
import { env, reportConfigWarnings } from './config/env.js'
import { verifyMailTransport } from './config/mailer.js'
import { connectDB } from './config/db.js'

reportConfigWarnings()
verifyMailTransport()
await connectDB()

const server = app.listen(env.port, () => {
  console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`)
  console.log(`Accepting requests from: ${env.clientUrls.join(', ')}`)
})

// Fail loudly instead of leaving the process in a broken state.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
  server.close(() => process.exit(1))
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})
