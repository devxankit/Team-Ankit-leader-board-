import User from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'

export async function getAllUsers(req, res) {
  const users = await User.find().select('-password').sort({ createdAt: -1 })
  res.json({
    success: true,
    count: users.length,
    users,
  })
}

export async function getUserById(req, res) {
  const user = await User.findById(req.params.id).select('-password')
  if (!user) {
    throw new ApiError(404, 'User not found')
  }
  res.json({
    success: true,
    user,
  })
}

export async function deleteUser(req, res) {
  if (req.user._id.toString() === req.params.id) {
    throw new ApiError(400, 'Cannot delete your own admin account')
  }

  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  res.json({
    success: true,
    message: 'User removed successfully',
  })
}
