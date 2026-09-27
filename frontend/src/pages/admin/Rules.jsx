import { useState } from 'react'
import { Archive, ArchiveRestore, ListChecks, Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import RuleFormDialog from '@/components/admin/RuleFormDialog'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import PointsChip from '@/components/ui/PointsChip'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Skeleton from '@/components/ui/Skeleton'
import { useAdminAction, useAdminRules } from '@/hooks/useAdmin'
import { cn } from '@/lib/cn'
import { adminService } from '@/services/adminService'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
  { value: 'all', label: 'All' },
]

function RuleRow({ rule, onEdit, onArchive, onRestore, restoring }) {
  return (
    <li className={cn('flex items-center gap-3 px-4 py-3 sm:px-5', !rule.isActive && 'opacity-60')}>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-subtle text-xl" aria-hidden="true">
        {rule.icon || '•'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{rule.label}</p>
        <p className="text-xs text-muted">
          {rule.category}
          {!rule.isActive && ' · Archived'}
        </p>
      </div>
      <PointsChip points={rule.points} />
      <div className="flex shrink-0 gap-1">
        {rule.isActive ? (
          <>
            <Button variant="ghost" size="icon" onClick={() => onEdit(rule)} aria-label={`Edit ${rule.label}`}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onArchive(rule)} aria-label={`Archive ${rule.label}`}>
              <Archive className="size-4" />
            </Button>
          </>
        ) : (
          <Button variant="secondary" size="sm" loading={restoring} onClick={() => onRestore(rule)}>
            <ArchiveRestore className="size-4" /> Restore
          </Button>
        )}
      </div>
    </li>
  )
}

export default function Rules() {
  const [status, setStatus] = useState('active')
  const { data: rules = [], isLoading } = useAdminRules(status)
  const [editing, setEditing] = useState(null) // a rule, 'new', or null
  const [archiving, setArchiving] = useState(null)

  const archive = useAdminAction(adminService.archiveRule, {
    onSuccess: (rule) => {
      toast.success(`“${rule.label}” archived`)
      setArchiving(null)
    },
  })
  const restore = useAdminAction((rule) => adminService.updateRule(rule.id, { isActive: true }), {
    onSuccess: (rule) => toast.success(`“${rule.label}” restored`),
  })

  const groups = [
    { title: 'Rewards', tone: 'text-reward', items: rules.filter((rule) => rule.points > 0) },
    { title: 'Penalties', tone: 'text-penalty', items: rules.filter((rule) => rule.points < 0) },
  ].filter((group) => group.items.length)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl label="Show rules" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        <Button onClick={() => setEditing('new')}>
          <Plus className="size-4" /> New rule
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-80" />
      ) : rules.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ListChecks}
            title={status === 'archived' ? 'No archived rules' : 'No rules yet'}
            description={
              status === 'archived'
                ? 'Archived rules show up here. You can restore them any time.'
                : 'Create reasons to give or take points, like “Task completed +10”.'
            }
            action={status !== 'archived' && <Button onClick={() => setEditing('new')}>Create a rule</Button>}
          />
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.title} className="card overflow-hidden">
            <h2 className={cn('border-b border-line px-4 py-3 text-xs font-bold uppercase tracking-wider sm:px-5', group.tone)}>
              {group.title} · {group.items.length}
            </h2>
            <ul className="divide-y divide-line">
              {group.items.map((rule) => (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  onEdit={setEditing}
                  onArchive={setArchiving}
                  onRestore={(r) => restore.mutate(r)}
                  restoring={restore.isPending && restore.variables?.id === rule.id}
                />
              ))}
            </ul>
          </section>
        ))
      )}

      <RuleFormDialog
        open={editing !== null}
        rule={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={Boolean(archiving)}
        title={`Archive “${archiving?.label}”?`}
        message="It disappears from the Give points screen. Past entries keep their label and points, and you can restore it later."
        confirmLabel="Archive rule"
        loading={archive.isPending}
        onConfirm={() => archive.mutate(archiving.id)}
        onCancel={() => setArchiving(null)}
      />
    </div>
  )
}
