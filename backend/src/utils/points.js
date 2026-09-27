import { MAX_POINTS } from '../config/constants.js'

/** A ledger amount: a non-zero whole number within ±MAX_POINTS. */
export const isValidPoints = (value) =>
  Number.isInteger(value) && value !== 0 && Math.abs(value) <= MAX_POINTS

export const pointsType = (points) => (points > 0 ? 'reward' : 'penalty')

/** Rules are edited as type + magnitude; the ledger stores the signed number. */
export const toSignedPoints = (type, magnitude) =>
  type === 'penalty' ? -Math.abs(magnitude) : Math.abs(magnitude)
