import { useState } from 'react'
import { ListChecks, Plus } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/admin/PageHeader'
import RuleFormDialog from '@/components/admin/RuleFormDialog'
import StatusBadge from '@/components/admin/StatusBadge'
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

  return (
    <>
      <PageHeader
        title="Rules"
        description="Reasons you give or take points. Editing a rule never changes past entries."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" /> New rule
          </Button>
        }
      />

      <div className="mb-4">
        <SegmentedControl label="Show rules" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
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
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-line bg-subtle/50 text-left text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Rule</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 text-right font-medium">Points</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rules.map((rule) => (
                  <tr key={rule.id} className={cn('transition hover:bg-subtle/40', !rule.isActive && 'text-muted')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-subtle text-base" aria-hidden="true">
                          {rule.icon || '•'}
                        </span>
                        <span className="font-medium">{rule.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{rule.category}</td>
                    <td className="px-4 py-3">
                      {rule.type === 'reward' ? <StatusBadge tone="green">Reward</StatusBadge> : <StatusBadge tone="red">Penalty</StatusBadge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PointsChip points={rule.points} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      {rule.isActive ? <StatusBadge tone="green">Active</StatusBadge> : <StatusBadge>Archived</StatusBadge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {rule.isActive ? (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => setEditing(rule)}>
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-penalty hover:text-penalty" onClick={() => setArchiving(rule)}>
                              Archive
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={restore.isPending && restore.variables?.id === rule.id}
                            onClick={() => restore.mutate(rule)}
                          >
                            Restore
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RuleFormDialog open={editing !== null} rule={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={Boolean(archiving)}
        title={`Archive “${archiving?.label}”?`}
        message="It disappears from Give points. Past entries keep their label and points, and you can restore it later."
        confirmLabel="Archive rule"
        loading={archive.isPending}
        onConfirm={() => archive.mutate(archiving.id)}
        onCancel={() => setArchiving(null)}
      />
    </>
  )
}
