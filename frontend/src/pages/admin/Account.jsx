import { useState } from 'react'
import { toast } from 'sonner'
import PageHeader from '@/components/admin/PageHeader'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Field, TextInput } from '@/components/ui/Field'
import { useAuth } from '@/hooks/useAuth'
import { PASSWORD_MIN_LENGTH } from '@/lib/constants'

const EMPTY_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' }

/** The admin's own sign-in details and password. */
export default function Account() {
  const { user, changePassword } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const onSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.currentPassword) nextErrors.currentPassword = 'Enter your current password'
    if (form.newPassword.length < PASSWORD_MIN_LENGTH) nextErrors.newPassword = `Use at least ${PASSWORD_MIN_LENGTH} characters`
    if (form.confirmPassword !== form.newPassword) nextErrors.confirmPassword = "Passwords don't match"
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      toast.success('Password updated')
      setForm(EMPTY_FORM)
    } catch (error) {
      setErrors(error.fieldErrors ?? {})
      if (!Object.keys(error.fieldErrors ?? {}).length) setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Account" description="Your admin sign-in." />

      <div className="grid max-w-3xl gap-6">
        <section className="card flex items-center gap-4 p-5">
          <Avatar name={user.name} color={user.avatarColor} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
        </section>

        <form onSubmit={onSubmit} className="card" noValidate>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-semibold">Change password</h2>
            <p className="mt-0.5 text-sm text-muted">Other devices where you're signed in will be signed out.</p>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Current password" error={errors.currentPassword} className="sm:col-span-2 sm:max-w-sm">
              {(id) => (
                <TextInput
                  id={id}
                  type="password"
                  autoComplete="current-password"
                  value={form.currentPassword}
                  onChange={update('currentPassword')}
                  error={errors.currentPassword}
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
              <p role="alert" className="rounded-xl bg-penalty-soft px-3 py-2.5 text-sm font-medium text-penalty sm:col-span-2">
                {formError}
              </p>
            )}
          </div>
          <div className="flex justify-end border-t border-line bg-subtle/30 px-5 py-3">
            <Button type="submit" loading={submitting}>
              Update password
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
