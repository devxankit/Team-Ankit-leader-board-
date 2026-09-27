import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { navItemsFor } from '@/lib/navigation'

/** Phone-only tab bar — the team mostly checks the board on their phones. */
export default function BottomNav() {
  const { isAdmin } = useAuth()

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg sm:hidden"
    >
      <div className="flex">
        {navItemsFor(isAdmin).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition',
                isActive ? 'text-accent' : 'text-muted'
              )
            }
          >
            <Icon className="size-5" /> {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
