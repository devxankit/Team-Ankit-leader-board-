import mongoose from 'mongoose'
import { env, isProduction } from './env.js'

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`)
    if (error.name === 'MongooseServerSelectionError' || error.message.includes('timed out')) {
      console.error(
        '\n💡 Troubleshooting MongoDB Connection:\n' +
        '  1. Atlas IP Whitelist: Go to MongoDB Atlas -> Network Access and add your IP (or 0.0.0.0/0 for dev).\n' +
        '  2. Local MongoDB: If running locally, set MONGODB_URI=mongodb://127.0.0.1:27017/vrushahi in backend/.env\n' +
        '  3. Network/Firewall: Check if your network/VPN blocks outgoing connections on port 27017.\n'
      )
    }
    if (isProduction) {
      process.exit(1)
    } else {
      console.warn('⚠️ Development mode: Server will continue running without MongoDB connection.')
    }
  }
}
