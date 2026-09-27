import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function AdminLogin() {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    try {
      setIsSubmitting(true)
      if (isRegister) {
        await register({ name, email, password })
      } else {
        await login(email, password)
      }
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <Link to="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-xl text-white shadow-lg shadow-indigo-600/30 mb-4">
            🚀
          </Link>
          <h2 className="text-2xl font-bold text-white">
            {isRegister ? 'Create an Account' : 'Portal Login'}
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            {isRegister ? 'Sign up to access user features' : 'Sign in to access admin and dashboard controls'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
            }}
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
          </button>

          <Link to="/" className="text-slate-400 hover:text-slate-200">
            Back to Home
          </Link>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-center text-xs text-slate-400">
          🔑 Default Admin: <span className="text-indigo-300">admin@example.com</span> / <span className="text-indigo-300">Admin@123456</span>
        </div>
      </div>
    </div>
  )
}
