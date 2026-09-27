import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { ADMIN_NAV_ITEMS } from '@/lib/navigation'

/** Phone-only tab bar for the signed-in admin (visitors only have the one page). */
export default function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg sm:hidden"
    >
      <div className="flex">
        {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
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
