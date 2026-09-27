// No 0/O or 1/l/I so a temporary password can be read out loud or retyped.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'

/** A random temporary password like "Kx7mPq2vRt9a". */
export function generatePassword(length = 12) {
  const values = crypto.getRandomValues(new Uint32Array(length))
  const password = Array.from(values, (value) => ALPHABET[value % ALPHABET.length]).join('')
  // Guarantee at least one digit.
  return /\d/.test(password) ? password : `${password.slice(0, -1)}7`
}
