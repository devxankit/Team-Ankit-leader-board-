import { useState } from 'react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Field, SelectInput, TextInput } from '@/components/ui/Field'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { useAdminAction } from '@/hooks/useAdmin'
import { MAX_POINTS, RULE_CATEGORIES } from '@/lib/constants'
import { adminService } from '@/services/adminService'

const TYPE_OPTIONS = [
  { value: 'reward', label: 'Reward (+)', activeClass: 'text-reward' },
  { value: 'penalty', label: 'Penalty (−)', activeClass: 'text-penalty' },
]

function RuleForm({ rule, onDone }) {
  const [form, setForm] = useState(() =>
    rule
      ? { label: rule.label, type: rule.type, points: String(Math.abs(rule.points)), category: rule.category, icon: rule.icon }
      : { label: '', type: 'reward', points: '10', category: 'Delivery', icon: '' }
  )
  const [errors, setErrors] = useState({})
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const save = useAdminAction(
    (body) => (rule ? adminService.updateRule(rule.id, body) : adminService.createRule(body)),
    {
      onSuccess: (saved) => {
        toast.success(rule ? `Rule “${saved.label}” updated` : `Rule “${saved.label}” created`)
        onDone()
      },
    }
  )

  const onSubmit = (event) => {
    event.preventDefault()
    const body = {
      label: form.label.trim(),
      type: form.type,
      points: Number(form.points),
      category: form.category,
      icon: form.icon.trim(),
    }
    save.mutate(body, { onError: (error) => setErrors(error.fieldErrors ?? {}) })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="Rule name" error={errors.label}>
        {(id) => (
          <TextInput
            id={id}
            value={form.label}
            onChange={(event) => set('label', event.target.value)}
            placeholder="e.g. Task completed"
            maxLength={60}
            error={errors.label}
            autoFocus
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" error={errors.type}>
          {() => (
            <SegmentedControl
              label="Rule type"
              options={TYPE_OPTIONS}
              value={form.type}
              onChange={(value) => set('type', value)}
              className="flex w-full"
            />
          )}
        </Field>
        <Field label="Points" error={errors.points}>
          {(id) => (
            <TextInput
              id={id}
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_POINTS}
              value={form.points}
              onChange={(event) => set('points', event.target.value)}
              error={errors.points}
            />
          )}
        </Field>
        <Field label="Category" error={errors.category}>
          {(id) => (
            <SelectInput id={id} value={form.category} onChange={(event) => set('category', event.target.value)}>
              {RULE_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </SelectInput>
          )}
        </Field>
        <Field label="Icon (optional)" error={errors.icon} hint="One emoji, e.g. ✅">
          {(id) => (
            <TextInput id={id} value={form.icon} onChange={(event) => set('icon', event.target.value)} maxLength={16} />
          )}
        </Field>
      </div>

      {rule && (
        <p className="rounded-xl bg-subtle px-3 py-2.5 text-xs text-muted">
          Changes apply to new entries only. Past entries keep the name and points they were given with.
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={save.isPending}>
          {rule ? 'Save changes' : 'Create rule'}
        </Button>
      </div>
    </form>
  )
}

export default function RuleFormDialog({ open, rule, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} title={rule ? 'Edit rule' : 'New rule'}>
      <RuleForm rule={rule} onDone={onClose} />
    </Dialog>
  )
}
