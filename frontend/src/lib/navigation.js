import { Shield, Trophy } from 'lucide-react'

/** Only the signed-in admin needs navigation; visitors just see the leaderboard. */
export const ADMIN_NAV_ITEMS = [
  { to: '/', label: 'Leaderboard', icon: Trophy, end: true },
  { to: '/admin', label: 'Admin', icon: Shield },
]
