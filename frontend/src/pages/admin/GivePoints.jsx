import { useState } from 'react'
import { Users } from 'lucide-react'
import { toast } from 'sonner'
import MemberMultiSelect from '@/components/admin/MemberMultiSelect'
import PageHeader from '@/components/admin/PageHeader'
import RecentEntries from '@/components/admin/RecentEntries'
import Button from '@/components/ui/Button'
import ButtonLink from '@/components/ui/ButtonLink'
import EmptyState from '@/components/ui/EmptyState'
import { Field, SelectInput, TextArea, TextInput } from '@/components/ui/Field'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Skeleton from '@/components/ui/Skeleton'
import { useAdminAction, useAdminMembers, useAdminRules } from '@/hooks/useAdmin'
import { cn } from '@/lib/cn'
import { MAX_POINTS, NOTE_MAX_LENGTH } from '@/lib/constants'
import { formatPoints, plural } from '@/lib/format'
import { adminService } from '@/services/adminService'

const TYPE_OPTIONS = [
  { value: 'reward', label: 'Reward', activeClass: 'text-reward' },
  { value: 'penalty', label: 'Penalty', activeClass: 'text-penalty' },
]

const ruleOption = (rule) => `${rule.icon ? `${rule.icon}  ` : ''}${rule.label}  (${formatPoints(rule.points)})`

export default function GivePoints() {
  const members = useAdminMembers('active')
  const rules = useAdminRules('active')
  const [selected, setSelected] = useState(() => new Set())
  const [reason, setReason] = useState('')
  const [custom, setCustom] = useState({ label: '', type: 'reward', points: '' })
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})

  const ruleList = rules.data ?? []
  const rule = ruleList.find((item) => item.id === reason)
  const isCustom = reason === 'custom'
  const customPoints = Number(custom.points)
  const customValid =
    custom.label.trim().length > 0 && Number.isInteger(customPoints) && customPoints >= 1 && customPoints <= MAX_POINTS
  const points = rule ? rule.points : isCustom && customValid ? (custom.type === 'penalty' ? -customPoints : customPoints) : null
  const label = rule ? rule.label : custom.label.trim()
  const canApply = selected.size > 0 && points !== null

  const apply = useAdminAction(adminService.applyPoints, {
    onSuccess: (result) => {
      toast.success(`${formatPoints(result.points)} applied to ${plural(result.count, 'person', 'people')}`, {
        description: result.label,
      })
      setSelected(new Set())
      setNote('')
      setErrors({})
    },
  })

  const onSubmit = (event) => {
    event.preventDefault()
    if (!canApply) return
    apply.mutate(
      {
        memberIds: [...selected],
        note: note.trim(),
        ...(rule ? { ruleId: rule.id } : { custom: { label, points } }),
      },
      { onError: (error) => setErrors(error.fieldErrors ?? {}) }
    )
  }

  const header = <PageHeader title="Give points" description="Reward or penalise one or more team members." />

  if (members.isLoading || rules.isLoading) {
    return (
      <>
        {header}
        <Skeleton className="h-96" />
      </>
    )
  }

  if (!members.data?.length) {
    return (
      <>
        {header}
        <div className="card">
          <EmptyState
            icon={Users}
            title="No team members yet"
            description="Add your team first, then you can give or take points here."
            action={<ButtonLink to="/admin/members">Add members</ButtonLink>}
          />
        </div>
      </>
    )
  }

  return (
    <>
      {header}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form onSubmit={onSubmit} className="card" noValidate>
          <div className="space-y-5 p-5 sm:p-6">
            <Field label="Members" error={errors.memberIds}>
              {(id) => (
                <MemberMultiSelect
                  id={id}
                  members={members.data}
                  selected={selected}
                  onChange={setSelected}
                  error={errors.memberIds}
                />
              )}
            </Field>

            <Field label="Reason" error={errors.ruleId}>
              {(id) => (
                <SelectInput id={id} value={reason} onChange={(event) => setReason(event.target.value)} error={errors.ruleId}>
                  <option value="" disabled>
                    Choose a reason…
                  </option>
                  <optgroup label="Rewards">
                    {ruleList
                      .filter((item) => item.points > 0)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {ruleOption(item)}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Penalties">
                    {ruleList
                      .filter((item) => item.points < 0)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {ruleOption(item)}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Other">
                    <option value="custom">Custom entry…</option>
                  </optgroup>
                </SelectInput>
              )}
            </Field>

            {isCustom && (
              <div className="grid gap-4 rounded-xl border border-line bg-subtle/40 p-4 sm:grid-cols-[1fr_auto_7rem]">
                <Field label="Label" error={errors['custom.label']}>
                  {(id) => (
                    <TextInput
                      id={id}
                      value={custom.label}
                      onChange={(event) => setCustom((c) => ({ ...c, label: event.target.value }))}
                      placeholder="e.g. Hackathon winner"
                      maxLength={60}
                      error={errors['custom.label']}
                    />
                  )}
                </Field>
                <Field label="Type">
                  {() => (
                    <SegmentedControl
                      label="Entry type"
                      options={TYPE_OPTIONS}
                      value={custom.type}
                      onChange={(type) => setCustom((c) => ({ ...c, type }))}
                      className="flex w-full"
                    />
                  )}
                </Field>
                <Field label="Points" error={errors['custom.points']}>
                  {(id) => (
                    <TextInput
                      id={id}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={MAX_POINTS}
                      value={custom.points}
                      onChange={(event) => setCustom((c) => ({ ...c, points: event.target.value }))}
                      placeholder="20"
                      error={errors['custom.points']}
                    />
                  )}
                </Field>
              </div>
            )}

            <Field
              label="Note (optional)"
              error={errors.note}
              hint={`${note.length}/${NOTE_MAX_LENGTH} · shown on the public feed`}
            >
              {(id) => (
                <TextArea
                  id={id}
                  value={note}
                  onChange={(event) => setNote(event.target.value.slice(0, NOTE_MAX_LENGTH))}
                  placeholder="e.g. Shipped the payments module a day early"
                  rows={3}
                  error={errors.note}
                />
              )}
            </Field>
          </div>

          <div className="flex flex-col gap-3 border-t border-line bg-subtle/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-muted">
              {canApply ? (
                <>
                  <span className={cn('font-semibold', points > 0 ? 'text-reward' : 'text-penalty')}>{formatPoints(points)}</span>{' '}
                  for <span className="font-medium text-ink">{label}</span> → {plural(selected.size, 'member')}
                  {selected.size > 1 && ` (${formatPoints(points * selected.size)} total)`}
                </>
              ) : (
                'Select members and a reason to continue.'
              )}
            </p>
            <Button type="submit" disabled={!canApply} loading={apply.isPending}>
              Apply points
            </Button>
          </div>
        </form>

        <RecentEntries title="Recently given" />
      </div>
    </>
  )
}
