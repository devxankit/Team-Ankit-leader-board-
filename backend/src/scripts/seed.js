import mongoose from 'mongoose'
import { env } from '../config/env.js'
import User from '../models/User.js'

export async function seedDatabase() {
  try {
    await mongoose.connect(env.mongodbUri)
    console.log('🌱 Connected to MongoDB for Seeding...')

    // Seed / Ensure Admin User
    let admin = await User.findOne({ email: 'admin@example.com' })
    if (!admin) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: 'Admin@123456',
        role: 'admin',
      })
      console.log('✅ Default Admin User created (Email: admin@example.com, Pass: Admin@123456)')
    } else {
      admin.password = 'Admin@123456'
      admin.role = 'admin'
      await admin.save()
      console.log('✅ Default Admin User verified (Email: admin@example.com, Pass: Admin@123456)')
    }

    // Seed Standard Demo User
    let demoUser = await User.findOne({ email: 'user@example.com' })
    if (!demoUser) {
      await User.create({
        name: 'Demo User',
        email: 'user@example.com',
        password: 'User@123456',
        role: 'user',
      })
      console.log('✅ Demo User created (Email: user@example.com, Pass: User@123456)')
    }

    console.log('🎉 Seeding Complete Successfully!')
  } catch (error) {
    console.error('❌ Seeding Error:', error)
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => mongoose.disconnect())
}
