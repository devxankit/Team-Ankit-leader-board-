import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import { AVATAR_COLORS, NAME_MAX_LENGTH, ROLES } from '../config/constants.js'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: NAME_MAX_LENGTH },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.MEMBER },
    designation: { type: String, trim: true, maxlength: NAME_MAX_LENGTH, default: '' },
    avatarColor: { type: String, default: AVATAR_COLORS[0] },

    /** Soft delete: inactive users can't sign in and drop off the leaderboard. */
    isActive: { type: Boolean, default: true },

    /** Set when the admin creates the account or resets its password. */
    mustChangePassword: { type: Boolean, default: false },

    /** Sessions issued before this moment are rejected (see auth.service). */
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

userSchema.index({ role: 1, isActive: 1 })

userSchema.methods.setPassword = async function setPassword(plainPassword) {
  this.passwordHash = await bcrypt.hash(plainPassword, env.bcryptRounds)
  this.passwordChangedAt = new Date()
}

/** Requires the document to have been loaded with `.select('+passwordHash')`. */
userSchema.methods.verifyPassword = function verifyPassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash)
}

export default mongoose.model('User', userSchema)
