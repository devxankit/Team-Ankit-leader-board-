// Vercel Serverless Function entry point for Express API backend
import app from '../src/app.js'
import { connectDB } from '../src/config/db.js'

// Connect to MongoDB Atlas (serverless execution reuses existing connection if active)
await connectDB()

export default app
