import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, Gift, ListChecks, Users } from 'lucide-react'
import { cn } from '@/lib/cn'

const TABS = [
  { to: '/admin/points', label: 'Give points', icon: Gift },
  { to: '/admin/rules', label: 'Rules', icon: ListChecks },
  { to: '/admin/members', label: 'Members', icon: Users },
  { to: '/admin/activity', label: 'Activity log', icon: CalendarDays },
]

export default function AdminLayout() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Admin panel</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold uppercase tracking-wide">Run the game</h1>
      </header>

      <nav aria-label="Admin sections" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex min-w-full gap-1 rounded-2xl border border-line bg-subtle p-1 sm:min-w-0">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition',
                  isActive ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
                )
              }
            >
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <Outlet />
    </div>
  )
}
