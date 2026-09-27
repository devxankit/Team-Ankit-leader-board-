import mongoose from 'mongoose'
import { env } from './env.js'

mongoose.set('strictQuery', true)

export async function connectDB(uri = env.mongodbUri) {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
  } catch (error) {
    throw new Error(
      `Could not connect to MongoDB (${error.message}).\n` +
        '  • Check MONGODB_URI in backend/.env\n' +
        '  • Atlas: allow your IP under Network Access\n' +
        '  • Local: make sure the MongoDB service is running\n' +
        '  • Atlas: check the username/password in the connection string',
      { cause: error }
    )
  }

  const { host, name } = mongoose.connection
  console.log(`[db] connected to ${host}/${name}`)
  return mongoose.connection
}

export function disconnectDB() {
  return mongoose.disconnect()
}

export const isDbConnected = () => mongoose.connection.readyState === 1
