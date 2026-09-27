import { CircleUserRound, Shield, Trophy } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Leaderboard', icon: Trophy, end: true },
  { to: '/me', label: 'My profile', icon: CircleUserRound, memberOnly: true },
  { to: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
]

/** Admins aren't ranked, so they get Admin instead of My profile. */
export const navItemsFor = (isAdmin) =>
  NAV_ITEMS.filter((item) => (isAdmin ? !item.memberOnly : !item.adminOnly))
