import { Link, NavLink, useNavigate } from 'react-router-dom'
import { CalendarDays, Gift, KeyRound, LayoutDashboard, ListChecks, LogOut, Trophy, Users } from 'lucide-react'
import { toast } from 'sonner'
import Logo from '@/components/layout/Logo'
import ThemeToggle from '@/components/layout/ThemeToggle'
import Avatar from '@/components/ui/Avatar'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/points', label: 'Give points', icon: Gift },
  { to: '/admin/members', label: 'Members', icon: Users },
  { to: '/admin/rules', label: 'Rules', icon: ListChecks },
  { to: '/admin/activity', label: 'Activity log', icon: CalendarDays },
]

const itemClass = ({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
    isActive ? 'bg-accent/12 text-accent' : 'text-muted hover:bg-subtle hover:text-ink'
  )

/** Admin navigation. `onNavigate` lets the mobile drawer close after a click. */
export default function AdminSidebar({ onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const signOut = async () => {
    onNavigate?.()
    await logout()
    toast.success('Signed out')
    navigate('/', { replace: true })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-line px-5">
        <Link to="/admin" onClick={onNavigate} aria-label="Admin overview">
          <Logo />
        </Link>
      </div>

      <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Manage</p>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate} className={itemClass}>
            <Icon className="size-[18px]" /> {label}
          </NavLink>
        ))}
        <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-muted">Public</p>
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-subtle hover:text-ink"
        >
          <Trophy className="size-[18px]" /> View leaderboard
        </Link>
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <Avatar name={user.name} color={user.avatarColor} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <NavLink to="/admin/account" onClick={onNavigate} className={itemClass}>
            <KeyRound className="size-4" /> Account
          </NavLink>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-penalty transition hover:bg-subtle"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
