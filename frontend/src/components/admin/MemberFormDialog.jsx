import { useState } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Field, TextInput } from '@/components/ui/Field'
import { useAdminAction } from '@/hooks/useAdmin'
import { copyToClipboard } from '@/lib/clipboard'
import { cn } from '@/lib/cn'
import { AVATAR_COLORS } from '@/lib/constants'
import { generatePassword } from '@/lib/password'
import { adminService } from '@/services/adminService'
import PasswordField from './PasswordField'

function MemberForm({ member, onDone }) {
  const [form, setForm] = useState(() =>
    member
      ? { name: member.name, email: member.email, designation: member.designation, avatarColor: member.avatarColor }
      : { name: '', email: '', designation: '', password: generatePassword(), avatarColor: '' }
  )
  const [errors, setErrors] = useState({})
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const save = useAdminAction(
    (body) => (member ? adminService.updateMember(member.id, body) : adminService.createMember(body)),
    {
      onSuccess: (saved) => {
        if (member) {
          toast.success(`${saved.name} updated`)
        } else {
          toast.success(`${saved.name} added to the team`, {
            description: `Temporary password: ${form.password}`,
            duration: 15000,
            action: { label: 'Copy', onClick: () => copyToClipboard(form.password, 'Password copied') },
          })
        }
        onDone()
      },
    }
  )

  const onSubmit = (event) => {
    event.preventDefault()
    const body = {
      name: form.name.trim(),
      email: form.email.trim(),
      designation: form.designation.trim(),
      ...(form.avatarColor ? { avatarColor: form.avatarColor } : {}),
      ...(member ? {} : { password: form.password }),
    }
    save.mutate(body, { onError: (error) => setErrors(error.fieldErrors ?? {}) })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="Full name" error={errors.name}>
        {(id) => (
          <TextInput
            id={id}
            value={form.name}
            onChange={(event) => set('name', event.target.value)}
            placeholder="Priya Sharma"
            error={errors.name}
            autoFocus
          />
        )}
      </Field>
      <Field label="Email" error={errors.email}>
        {(id) => (
          <TextInput
            id={id}
            type="email"
            value={form.email}
            onChange={(event) => set('email', event.target.value)}
            placeholder="priya@company.com"
            error={errors.email}
          />
        )}
      </Field>
      <Field label="Designation" error={errors.designation}>
        {(id) => (
          <TextInput
            id={id}
            value={form.designation}
            onChange={(event) => set('designation', event.target.value)}
            placeholder="MERN Developer"
            error={errors.designation}
          />
        )}
      </Field>

      {!member && (
        <PasswordField value={form.password} onChange={(value) => set('password', value)} error={errors.password} />
      )}

      <Field label="Avatar colour" error={errors.avatarColor} hint={member ? undefined : 'Leave unselected to pick automatically.'}>
        {() => (
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => set('avatarColor', form.avatarColor === color && !member ? '' : color)}
                className={cn(
                  'grid size-8 place-items-center rounded-full text-white ring-offset-2 ring-offset-surface transition',
                  form.avatarColor === color && 'ring-2 ring-ink'
                )}
                style={{ backgroundColor: color }}
                aria-label={`Colour ${color}`}
                aria-pressed={form.avatarColor === color}
              >
                {form.avatarColor === color && <Check className="size-4" strokeWidth={3} />}
              </button>
            ))}
          </div>
        )}
      </Field>

      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={save.isPending}>
          {member ? 'Save changes' : 'Add member'}
        </Button>
      </div>
    </form>
  )
}

export default function MemberFormDialog({ open, member, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={member ? `Edit ${member.name}` : 'Add a team member'}
      description={member ? undefined : "They'll sign in with this email and the temporary password."}
    >
      <MemberForm member={member} onDone={onClose} />
    </Dialog>
  )
}
