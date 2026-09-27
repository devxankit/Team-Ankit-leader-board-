import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Flame, Trophy, Zap } from 'lucide-react'
import { toast } from 'sonner'
import Logo from '@/components/layout/Logo'
import ThemeToggle from '@/components/layout/ThemeToggle'
import Button from '@/components/ui/Button'
import { Field, TextInput } from '@/components/ui/Field'
import { useAuth } from '@/hooks/useAuth'
import { firstName } from '@/lib/format'

const homeFor = (user) => (user.role === 'admin' ? '/admin/points' : '/')

const HIGHLIGHTS = [
  { icon: Trophy, text: 'Live podium and standings' },
  { icon: Zap, text: 'Levels from Rookie to Legend' },
  { icon: Flame, text: 'Streaks that set you on fire' },
]

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={location.state?.from ?? homeFor(user)} replace />

  const onSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const signedIn = await login(email, password)
      toast.success(`Welcome back, ${firstName(signedIn.name)}!`)
      navigate(location.state?.from ?? homeFor(signedIn), { replace: true })
    } catch (loginError) {
      setError(loginError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#1b1740] via-[#12132b] to-[#090c15] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-[#8b7dff]/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative [&_*]:!text-white">
          <Logo />
        </div>
        <div className="relative">
          <h1 className="font-display text-7xl font-black uppercase leading-[0.9] tracking-wide">
            Every point
            <br />
            <span className="text-amber-300">counts.</span>
          </h1>
          <ul className="mt-8 space-y-3 text-white/80">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-lg bg-white/10">
                  <Icon className="size-4 text-amber-300" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/50">Team Ankit · performance leaderboard</p>
      </aside>

      <main className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between lg:justify-end">
          <span className="lg:hidden">
            <Logo />
          </span>
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h2 className="font-display text-4xl font-extrabold uppercase tracking-wide">Sign in</h2>
          <p className="mt-1 text-sm text-muted">Use the email and password your admin gave you.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            <Field label="Email" error={error?.fieldErrors?.email}>
              {(id) => (
                <TextInput
                  id={id}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  error={error?.fieldErrors?.email}
                  required
                  autoFocus
                />
              )}
            </Field>
            <Field label="Password" error={error?.fieldErrors?.password}>
              {(id) => (
                <TextInput
                  id={id}
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  error={error?.fieldErrors?.password}
                  required
                />
              )}
            </Field>

            {error && !Object.keys(error.fieldErrors ?? {}).length && (
              <p role="alert" className="rounded-xl bg-penalty-soft px-3 py-2.5 text-sm font-medium text-penalty">
                {error.message}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              Sign in
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted">Forgot your password? Ask your admin to reset it.</p>
        </div>
      </main>
    </div>
  )
}
