/**
 * npm run seed:demo              → admin + starter rules + 8 demo members with ~6 weeks of history
 * npm run seed:demo -- --reset   → delete the demo members and regenerate them
 *
 * For trying the app out. Refuses to run with NODE_ENV=production.
 */
import { connectDB, disconnectDB } from '../config/db.js'
import { assertEnv, env, isProduction } from '../config/env.js'
import { seedAdmin, seedDemoTeam, seedStarterRules } from './seeders.js'

try {
  if (isProduction) throw new Error('Demo data is for development only (NODE_ENV=production).')
  assertEnv(['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'])
  await connectDB()
  const admin = await seedAdmin(env.admin)
  await seedStarterRules()
  await seedDemoTeam({ admin, reset: process.argv.includes('--reset') })
  console.log('🌱 Demo data ready.')
} catch (error) {
  console.error(`\n✗ Demo seed failed: ${error.message}\n`)
  process.exitCode = 1
} finally {
  await disconnectDB()
}
