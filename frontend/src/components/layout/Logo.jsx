import { Link } from 'react-router-dom'
import { siteConfig } from '@/config/site'

export default function Logo({ className = '' }) {
  return (
    <Link
      to="/"
      aria-label={`${siteConfig.name} — Home`}
      className={`group inline-flex items-center gap-2.5 font-bold tracking-tight text-white ${className}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
        ⚡
      </span>
      <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
        {siteConfig.name}
      </span>
    </Link>
  )
}
