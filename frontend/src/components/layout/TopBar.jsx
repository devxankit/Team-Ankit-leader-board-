import { Link } from 'react-router-dom'
import { LayoutDashboard, Shield } from 'lucide-react'
import ButtonLink from '@/components/ui/ButtonLink'
import { useAuth } from '@/hooks/useAuth'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

/** Public top bar: the brand, theme switch, and the way into the admin panel. */
export default function TopBar() {
  const { isAdmin, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/75 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" aria-label="Team Ankit leaderboard — home">
          <Logo />
        </Link>
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          {!isLoading &&
            (isAdmin ? (
              <ButtonLink to="/admin" size="sm">
                <LayoutDashboard className="size-4" /> Admin panel
              </ButtonLink>
            ) : (
              <ButtonLink to="/login" variant="ghost" size="sm" title="Admin sign in">
                <Shield className="size-4" /> Admin
              </ButtonLink>
            ))}
        </div>
      </div>
    </header>
  )
}
