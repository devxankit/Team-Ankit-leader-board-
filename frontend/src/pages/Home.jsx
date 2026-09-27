import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth()

  const features = [
    {
      title: 'Full-Stack Architecture',
      description: 'Production-ready Express.js API backend paired with modern Vite + React 19 frontend.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: 'JWT Authentication & RBAC',
      description: 'Built-in secure authentication system with role-based access control (Admin & User roles).',
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: 'Admin Dashboard Ready',
      description: 'Responsive Admin portal with user management, statistics overview, and profile controls.',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'TailwindCSS Styling',
      description: 'Tailwind CSS setup with sleek dark mode aesthetics, glassmorphism, and responsive components.',
      icon: (
        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      title: 'MongoDB / Mongoose ORM',
      description: 'Pre-configured schema models, connection handling, index optimizations, and database seed script.',
      icon: (
        <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
    },
    {
      title: 'Security & Error Handling',
      description: 'Helmet, CORS, express-rate-limit, input validation with Zod, and centralized ApiError handler.',
      icon: (
        <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ]

  const techStack = [
    { name: 'React 19', tag: 'Frontend' },
    { name: 'Vite 8', tag: 'Bundler' },
    { name: 'Tailwind CSS', tag: 'Styling' },
    { name: 'Express.js', tag: 'Backend' },
    { name: 'Node.js', tag: 'Runtime' },
    { name: 'MongoDB', tag: 'Database' },
    { name: 'JWT Auth', tag: 'Security' },
    { name: 'Zod', tag: 'Validation' },
  ]

  return (
    <div className="space-y-24 py-12 md:py-20">
      {/* Hero Section */}
      <section className="relative text-center px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Ready-to-use Boilerplate Template
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Kickstart Your Next Project{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Without Wasting Time
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
          Clean folder structure, pre-configured dependencies, JWT authentication,
          MongoDB integration, admin dashboard, and modern responsive UI. Clone and build right away.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4">
          {isAuthenticated ? (
            <Link
              to={isAdmin ? '/admin/dashboard' : '/about'}
              className="px-6 py-3.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all duration-200"
            >
              Go to {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all duration-200"
            >
              Sign In / Admin Access
            </Link>
          )}

          <Link
            to="/about"
            className="px-6 py-3.5 rounded-xl font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all duration-200"
          >
            Explore Structure
          </Link>
        </div>

        {/* Tech Stack Pills */}
        <div className="mt-14 flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
          {techStack.map((tech) => (
            <span
              key={tech.name}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
            >
              <span className="text-indigo-400 font-semibold">{tech.name}</span> · {tech.tag}
            </span>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Core Foundation Included
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Everything you need for full-stack web applications without repeating boilerplate setup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Setup Guide Band */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-purple-950/30 border border-indigo-500/20 text-center">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
            Default Credentials & Quick Start
          </h3>
          <p className="text-slate-300 text-sm mb-6 max-w-xl mx-auto">
            Use the seeded admin account to log into the Admin portal and start managing the system.
          </p>
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
            <span>Email: <strong className="text-indigo-400">admin@example.com</strong></span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span>Password: <strong className="text-indigo-400">Admin@123456</strong></span>
          </div>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Login now →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
