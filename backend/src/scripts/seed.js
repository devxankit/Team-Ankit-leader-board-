/**
 * npm run seed                            → admin (from ADMIN_* in .env) + starter rules
 * npm run seed -- --reset-admin-password  → also sets the admin's password to ADMIN_PASSWORD
 *
 * Safe to run repeatedly: existing data is never duplicated or overwritten.
 */
import { connectDB, disconnectDB } from '../config/db.js'
import { assertEnv, env } from '../config/env.js'
import { seedAdmin, seedStarterRules } from './seeders.js'

try {
  assertEnv(['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'])
  await connectDB()
  await seedAdmin(env.admin, { resetPassword: process.argv.includes('--reset-admin-password') })
  await seedStarterRules()
  console.log('🌱 Seed complete.')
} catch (error) {
  console.error(`\n✗ Seed failed: ${error.message}\n`)
  process.exitCode = 1
} finally {
  await disconnectDB()
}
