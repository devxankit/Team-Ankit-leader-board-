import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import { AVATAR_COLORS, NAME_MAX_LENGTH, ROLES } from '../config/constants.js'

/** Only the admin signs in; teammates are listed on the public board without an account. */
function isAdmin() {
  return this.role === ROLES.ADMIN
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: NAME_MAX_LENGTH },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.MEMBER },
    designation: { type: String, trim: true, maxlength: NAME_MAX_LENGTH, default: '' },
    avatarColor: { type: String, default: AVATAR_COLORS[0] },

    /** Soft delete: inactive members drop off the leaderboard but keep their history. */
    isActive: { type: Boolean, default: true },

    // ── Sign-in (admin only) ──
    email: { type: String, trim: true, lowercase: true, required: isAdmin },
    passwordHash: { type: String, select: false, required: isAdmin },
    /** Sessions issued before this moment are rejected (see auth.service). */
    passwordChangedAt: { type: Date, default: null },

    /** Created by `npm run seed:demo`; removed by `npm run seed:demo -- --reset`. */
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Unique among accounts that have an email (the admin); teammates have none.
userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } })
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
