import { useState } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Field, TextInput } from '@/components/ui/Field'
import { useAdminAction } from '@/hooks/useAdmin'
import { cn } from '@/lib/cn'
import { AVATAR_COLORS } from '@/lib/constants'
import { adminService } from '@/services/adminService'

/** Teammates have no account — just a name, designation and avatar colour. */
function MemberForm({ member, onDone }) {
  const [form, setForm] = useState(() =>
    member
      ? { name: member.name, designation: member.designation, avatarColor: member.avatarColor }
      : { name: '', designation: '', avatarColor: '' }
  )
  const [errors, setErrors] = useState({})
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const save = useAdminAction(
    (body) => (member ? adminService.updateMember(member.id, body) : adminService.createMember(body)),
    {
      onSuccess: (saved) => {
        toast.success(member ? `${saved.name} updated` : `${saved.name} added to the leaderboard`)
        onDone()
      },
    }
  )

  const onSubmit = (event) => {
    event.preventDefault()
    const body = {
      name: form.name.trim(),
      designation: form.designation.trim(),
      ...(form.avatarColor ? { avatarColor: form.avatarColor } : {}),
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

      <Field
        label="Avatar colour"
        error={errors.avatarColor}
        hint={member ? undefined : 'Leave unselected to pick one automatically.'}
      >
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
      description={member ? undefined : 'They appear on the public leaderboard right away — no account needed.'}
    >
      <MemberForm member={member} onDone={onClose} />
    </Dialog>
  )
}
