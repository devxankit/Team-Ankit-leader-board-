import { Link, NavLink } from 'react-router-dom'
import { Shield } from 'lucide-react'
import ButtonLink from '@/components/ui/ButtonLink'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { ADMIN_NAV_ITEMS } from '@/lib/navigation'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import UserMenu from './UserMenu'

export default function TopBar() {
  const { isAdmin, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="Team Ankit leaderboard — home">
          <Logo />
        </Link>

        {isAdmin && (
          <nav aria-label="Main" className="ml-4 hidden items-center gap-1 sm:flex">
            {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
                    isActive ? 'bg-surface text-ink shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink'
                  )
                }
              >
                <Icon className="size-4" /> {label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          {isAdmin ? (
            <UserMenu />
          ) : (
            !isLoading && (
              <ButtonLink to="/login" variant="ghost" size="sm" title="Admin sign in">
                <Shield className="size-4" /> Admin
              </ButtonLink>
            )
          )}
        </div>
      </div>
    </header>
  )
}
