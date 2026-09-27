import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import User from '../models/User.js'

function generateToken(id) {
  return jwt.sign({ id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  })
}

export async function register(req, res) {
  const { name, email, password } = req.body

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password')
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    throw new ApiError(400, 'User already exists with this email')
  }

  const user = await User.create({
    name: name || 'User',
    email: email.toLowerCase(),
    password,
    role: 'user',
  })

  const token = generateToken(user._id)

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

export async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password')
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

  if (!user) {
    throw new ApiError(401, 'Invalid credentials')
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials')
  }

  const token = generateToken(user._id)

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

export async function getMe(req, res) {
  res.json({
    success: true,
    user: req.user,
  })
}

export async function updateProfile(req, res) {
  const { name, email } = req.body
  const user = await User.findById(req.user._id)

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  if (name) user.name = name
  if (email && email.toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      throw new ApiError(400, 'Email is already in use by another user')
    }
    user.email = email.toLowerCase()
  }

  await user.save()

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Please provide current and new passwords')
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long')
  }

  const user = await User.findById(req.user._id).select('+password')
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const isMatch = await user.comparePassword(currentPassword)
  if (!isMatch) {
    throw new ApiError(400, 'Incorrect current password')
  }

  user.password = newPassword
  await user.save()

  res.json({
    success: true,
    message: 'Password updated successfully',
  })
}
