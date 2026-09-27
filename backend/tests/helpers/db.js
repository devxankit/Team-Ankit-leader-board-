import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import PointEvent from '../../src/models/PointEvent.js'
import Rule from '../../src/models/Rule.js'
import User from '../../src/models/User.js'

/**
 * Each database test file gets its own throwaway in-memory MongoDB, started
 * only by files that need it — pure unit tests never pay for a database.
 */
let mongod

export async function connectTestDb() {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri(), { dbName: 'ta_test' })
  await Promise.all([User.init(), Rule.init(), PointEvent.init()])
}

export async function clearTestDb() {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({}))
  )
}

export async function disconnectTestDb() {
  await mongoose.disconnect()
  await mongod?.stop()
}
