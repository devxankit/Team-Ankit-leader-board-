import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

/**
 * Per-IP submission limit for the form endpoints.
 *
 * The legacy PHP enforced one submission per 300 seconds per PHP session, which
 * a bot defeats by not sending the session cookie. This is keyed on IP instead.
 */
export const formLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  limit: env.rateLimit.max,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many submissions from this network. Please wait a few minutes and try again.',
  },
})

/** Looser ceiling on the API as a whole, to blunt scripted abuse. */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
})
