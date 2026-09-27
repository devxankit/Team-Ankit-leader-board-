import { useState } from 'react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { useAdminAction } from '@/hooks/useAdmin'
import { copyToClipboard } from '@/lib/clipboard'
import { generatePassword } from '@/lib/password'
import { adminService } from '@/services/adminService'
import PasswordField from './PasswordField'

function ResetForm({ member, onDone }) {
  const [password, setPassword] = useState(generatePassword)
  const [error, setError] = useState()

  const reset = useAdminAction(() => adminService.resetPassword(member.id, password), {
    onSuccess: () => {
      toast.success(`Password reset for ${member.name}`, {
        description: `New temporary password: ${password}`,
        duration: 15000,
        action: { label: 'Copy', onClick: () => copyToClipboard(password, 'Password copied') },
      })
      onDone()
    },
  })

  const onSubmit = (event) => {
    event.preventDefault()
    reset.mutate(undefined, { onError: (err) => setError(err.fieldErrors?.password) })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <PasswordField value={password} onChange={setPassword} error={error} />
      <p className="rounded-xl bg-subtle px-3 py-2.5 text-xs text-muted">
        {member.name} will be signed out everywhere and asked to choose a new password at next sign-in.
      </p>
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={reset.isPending}>
          Reset password
        </Button>
      </div>
    </form>
  )
}

export default function ResetPasswordDialog({ member, onClose }) {
  return (
    <Dialog open={Boolean(member)} onClose={onClose} title={member ? `Reset password for ${member.name}` : ''}>
      {member && <ResetForm member={member} onDone={onClose} />}
    </Dialog>
  )
}
