const MINUS = '−'
const numberFormat = new Intl.NumberFormat('en-IN')

/** Signed amount for a ledger entry: +10 / −15. */
export const formatPoints = (points) =>
  points > 0 ? `+${numberFormat.format(points)}` : points < 0 ? `${MINUS}${numberFormat.format(-points)}` : '0'

/** A running total, which may be negative: 1,250 / −40. */
export const formatTotal = (points) =>
  points < 0 ? `${MINUS}${numberFormat.format(-points)}` : numberFormat.format(points)

export const plural = (count, word, pluralWord = `${word}s`) => `${count} ${count === 1 ? word : pluralWord}`

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()

export const firstName = (name = '') => name.trim().split(/\s+/)[0]

export function formatDate(value) {
  const date = new Date(value)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) })
}

export const formatDateTime = (value) =>
  `${formatDate(value)}, ${new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`

/** Compact relative time: just now · 5m ago · 2h ago · 3d ago · 12 Sep */
export function timeAgo(value, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - new Date(value).getTime()) / 1000))
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(value)
}

export const PERIOD_LABELS = { all: 'All time', month: 'This month', week: 'This week' }
