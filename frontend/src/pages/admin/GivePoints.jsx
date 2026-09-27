import { useState } from 'react'
import { ListChecks, Users } from 'lucide-react'
import { toast } from 'sonner'
import MemberPicker from '@/components/admin/MemberPicker'
import RuleChips from '@/components/admin/RuleChips'
import Button from '@/components/ui/Button'
import ButtonLink from '@/components/ui/ButtonLink'
import EmptyState from '@/components/ui/EmptyState'
import { Field, TextArea, TextInput } from '@/components/ui/Field'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Skeleton from '@/components/ui/Skeleton'
import { useAdminAction, useAdminMembers, useAdminRules } from '@/hooks/useAdmin'
import { cn } from '@/lib/cn'
import { MAX_POINTS, NOTE_MAX_LENGTH } from '@/lib/constants'
import { formatPoints, plural } from '@/lib/format'
import { adminService } from '@/services/adminService'

const TYPE_OPTIONS = [
  { value: 'reward', label: 'Reward (+)', activeClass: 'text-reward' },
  { value: 'penalty', label: 'Penalty (−)', activeClass: 'text-penalty' },
]

function Step({ number, title, hint, children }) {
  return (
    <section className="card p-4 sm:p-5">
      <header className="mb-4 flex items-baseline gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-sm font-extrabold text-accent-ink">
          {number}
        </span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
      </header>
      {children}
    </section>
  )
}

export default function GivePoints() {
  const members = useAdminMembers('active')
  const rules = useAdminRules('active')
  const [selected, setSelected] = useState(() => new Set())
  const [choice, setChoice] = useState(null)
  const [custom, setCustom] = useState({ label: '', type: 'reward', points: '' })
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})

  const customPoints = Number(custom.points)
  const customValid =
    custom.label.trim().length > 0 && Number.isInteger(customPoints) && customPoints > 0 && customPoints <= MAX_POINTS
  const points =
    choice?.kind === 'rule' ? choice.rule.points : customValid ? (custom.type === 'penalty' ? -customPoints : customPoints) : null
  const label = choice?.kind === 'rule' ? choice.rule.label : custom.label.trim()
  const canApply = selected.size > 0 && points !== null && (choice?.kind === 'rule' || customValid)

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

  const onApply = () => {
    const body = {
      memberIds: [...selected],
      note: note.trim(),
      ...(choice.kind === 'rule' ? { ruleId: choice.rule.id } : { custom: { label, points } }),
    }
    apply.mutate(body, { onError: (error) => setErrors(error.fieldErrors ?? {}) })
  }

  if (members.isLoading || rules.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!members.data?.length) {
    return (
      <div className="card">
        <EmptyState
          icon={Users}
          title="No team members yet"
          description="Add your team first. Then you can give or take points here."
          action={<ButtonLink to="/admin/members">Add members</ButtonLink>}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-24 sm:pb-0">
      <Step number={1} title="Who?" hint="Pick one person, a few, or everyone.">
        <MemberPicker members={members.data} selected={selected} onChange={setSelected} />
        {errors.memberIds && <p className="mt-2 text-xs font-medium text-penalty">{errors.memberIds}</p>}
      </Step>

      <Step number={2} title="What for?" hint="Choose a rule, or enter a one-off amount.">
        {rules.data?.length === 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-subtle px-3 py-2.5 text-sm text-muted">
            <ListChecks className="size-4" /> No rules yet — use a custom entry or
            <ButtonLink to="/admin/rules" variant="secondary" size="sm">
              create rules
            </ButtonLink>
          </div>
        )}
        <RuleChips rules={rules.data ?? []} choice={choice} onChoose={setChoice} />

        {choice?.kind === 'custom' && (
          <div className="mt-5 grid gap-4 rounded-2xl border border-line bg-canvas/50 p-4 sm:grid-cols-[1fr_auto_8rem]">
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
      </Step>

      <Step number={3} title="Note" hint="Optional — shown in the activity feed.">
        <Field error={errors.note} hint={`${note.length}/${NOTE_MAX_LENGTH}`}>
          {(id) => (
            <TextArea
              id={id}
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, NOTE_MAX_LENGTH))}
              placeholder="e.g. Shipped the payments module a day early"
              rows={2}
              error={errors.note}
              aria-label="Note"
            />
          )}
        </Field>
      </Step>

      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:static sm:rounded-2xl sm:border sm:px-5">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-sm text-muted">
            {canApply ? (
              <>
                <span className={cn('font-extrabold', points > 0 ? 'text-reward' : 'text-penalty')}>
                  {formatPoints(points)}
                </span>{' '}
                <span className="font-semibold text-ink">{label}</span> → {plural(selected.size, 'person', 'people')}
              </>
            ) : (
              'Pick people and a reason to continue.'
            )}
          </p>
          <Button size="lg" disabled={!canApply} loading={apply.isPending} onClick={onApply}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}
