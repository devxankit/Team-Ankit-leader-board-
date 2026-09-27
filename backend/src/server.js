import http from 'node:http'
import app from './app.js'
import { connectDB, disconnectDB } from './config/db.js'
import { assertEnv, env } from './config/env.js'
import { closeSockets, initSockets } from './sockets/index.js'

async function start() {
  assertEnv()
  await connectDB()

  const httpServer = http.createServer(app)
  initSockets(httpServer)

  await new Promise((resolve, reject) => {
    httpServer.once('error', (error) => {
      reject(
        error.code === 'EADDRINUSE'
          ? new Error(`Port ${env.port} is already in use. Stop the other process or set PORT in backend/.env.`)
          : error
      )
    })
    httpServer.listen(env.port, resolve)
  })

  console.log(`[server] TA API on http://localhost:${env.port} (${env.nodeEnv}, timezone ${env.timezone})`)

  const shutdown = async (signal) => {
    console.log(`[server] ${signal} received — shutting down`)
    await closeSockets()
    await new Promise((resolve) => httpServer.close(resolve))
    await disconnectDB()
    process.exit(0)
  }
  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)
}

try {
  await start()
} catch (error) {
  console.error(`\n[server] ${error.message}\n`)
  // The database connection would otherwise keep a failed server process alive.
  await disconnectDB().catch(() => {})
  process.exit(1)
}
