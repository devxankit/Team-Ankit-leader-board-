import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { navLinks } from '@/data/navigation'
import Logo from './Logo'

export default function Header() {
  const { isAuthenticated, isAdmin, user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Auth CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to={isAdmin ? '/admin/dashboard' : '/about'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
            >
              <span>{isAdmin ? 'Admin Console' : user?.name || 'Dashboard'}</span>
              <span>→</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-3">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block text-sm py-2 px-3 rounded-lg font-medium ${
                  isActive ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className="pt-2 border-t border-slate-800">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/about'}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
              >
                {isAdmin ? 'Admin Console' : user?.name || 'Dashboard'}
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
