import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import Logo from '@/components/layout/Logo'
import Button from '@/components/ui/Button'
import { Field, TextInput } from '@/components/ui/Field'
import { useAuth } from '@/hooks/useAuth'
import { PASSWORD_MIN_LENGTH } from '@/lib/constants'

/** The admin's password, reachable from the account menu. */
export default function ChangePassword() {
  const { changePassword } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const onSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (form.newPassword.length < PASSWORD_MIN_LENGTH) nextErrors.newPassword = `Use at least ${PASSWORD_MIN_LENGTH} characters`
    if (form.confirmPassword !== form.newPassword) nextErrors.confirmPassword = "Passwords don't match"
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      toast.success('Password updated')
      navigate('/admin/points', { replace: true })
    } catch (error) {
      setErrors(error.fieldErrors ?? {})
      if (!Object.keys(error.fieldErrors ?? {}).length) setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="card w-full max-w-md p-6 sm:p-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent/12 text-accent">
          <KeyRound className="size-6" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Change password</h1>
        <p className="mt-1 text-sm text-muted">Other devices where you're signed in will be signed out.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <Field label="Current password" error={errors.currentPassword}>
            {(id) => (
              <TextInput
                id={id}
                type="password"
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={update('currentPassword')}
                error={errors.currentPassword}
                autoFocus
              />
            )}
          </Field>
          <Field label="New password" error={errors.newPassword} hint={`At least ${PASSWORD_MIN_LENGTH} characters`}>
            {(id) => (
              <TextInput
                id={id}
                type="password"
                autoComplete="new-password"
                value={form.newPassword}
                onChange={update('newPassword')}
                error={errors.newPassword}
              />
            )}
          </Field>
          <Field label="Confirm new password" error={errors.confirmPassword}>
            {(id) => (
              <TextInput
                id={id}
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                error={errors.confirmPassword}
              />
            )}
          </Field>

          {formError && (
            <p role="alert" className="rounded-xl bg-penalty-soft px-3 py-2.5 text-sm font-medium text-penalty">
              {formError}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            Save password
          </Button>
        </form>

        <div className="mt-5 text-center text-sm">
          <Link to="/admin" className="inline-flex items-center gap-1.5 font-semibold text-muted hover:text-ink">
            <ArrowLeft className="size-4" /> Back to the admin panel
          </Link>
        </div>
      </div>
    </div>
  )
}
