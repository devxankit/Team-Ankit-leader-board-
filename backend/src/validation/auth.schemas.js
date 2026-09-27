import { z } from 'zod'
import { email, newPassword } from './common.js'

export const loginBody = z.object({
  email,
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required').max(200),
})

export const changePasswordBody = z.object({
  currentPassword: z
    .string({ error: 'Current password is required' })
    .min(1, 'Current password is required'),
  newPassword,
})
