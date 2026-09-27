import { useState } from 'react'
import { Search, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'
import MemberFormDialog from '@/components/admin/MemberFormDialog'
import PageHeader from '@/components/admin/PageHeader'
import StatusBadge from '@/components/admin/StatusBadge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Skeleton from '@/components/ui/Skeleton'
import { useAdminAction, useAdminMembers } from '@/hooks/useAdmin'
import { useLeaderboard } from '@/hooks/useBoard'
import { cn } from '@/lib/cn'
import { formatTotal } from '@/lib/format'
import { adminService } from '@/services/adminService'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'all', label: 'All' },
]

export default function Members() {
  const [status, setStatus] = useState('active')
  const [query, setQuery] = useState('')
  const { data: members = [], isLoading } = useAdminMembers(status)
  const { data: board } = useLeaderboard('all')
  const [editing, setEditing] = useState(null) // a member, 'new', or null
  const [toggling, setToggling] = useState(null)

  const points = new Map((board?.rows ?? []).map((row) => [row.member.id, row.allTimePoints]))
  const needle = query.trim().toLowerCase()
  const visible = needle
    ? members.filter((member) => `${member.name} ${member.designation}`.toLowerCase().includes(needle))
    : members

  const setActive = useAdminAction(({ id, isActive }) => adminService.setMemberStatus(id, isActive), {
    onSuccess: (member) => {
      toast.success(member.isActive ? `${member.name} reactivated` : `${member.name} deactivated`)
      setToggling(null)
    },
  })
  const deactivating = toggling?.isActive

  return (
    <>
      <PageHeader
        title="Members"
        description="Everyone on the leaderboard. Teammates don't need an account."
        actions={
          <Button onClick={() => setEditing('new')}>
            <UserPlus className="size-4" /> Add member
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative sm:w-72">
          <span className="sr-only">Search members</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or designation"
            className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/35"
          />
        </label>
        <SegmentedControl label="Show members" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      </div>

      {isLoading ? (
        <Skeleton className="h-80" />
      ) : visible.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title={needle ? 'No members match your search' : status === 'inactive' ? 'No inactive members' : 'No team members yet'}
            description={
              needle
                ? 'Try a different name.'
                : status === 'inactive'
                  ? 'Deactivated members show up here, with their history kept.'
                  : 'Add your team so they appear on the public leaderboard.'
            }
            action={!needle && status !== 'inactive' && <Button onClick={() => setEditing('new')}>Add the first member</Button>}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-line bg-subtle/50 text-left text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Designation</th>
                  <th className="px-4 py-3 text-right font-medium">All-time points</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((member) => (
                  <tr key={member.id} className="transition hover:bg-subtle/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={member.name}
                          color={member.avatarColor}
                          size="sm"
                          className={cn(!member.isActive && 'grayscale')}
                        />
                        <span className="font-medium">{member.name}</span>
                        {member.isDemo && (
                          <span className="rounded-md bg-subtle px-1.5 py-px text-[10px] font-semibold uppercase text-muted" title="Sample data">
                            Demo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{member.designation || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium tabular">
                      {points.has(member.id) ? formatTotal(points.get(member.id)) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {member.isActive ? <StatusBadge tone="green">Active</StatusBadge> : <StatusBadge>Inactive</StatusBadge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditing(member)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={member.isActive ? 'text-penalty hover:text-penalty' : ''}
                          onClick={() => setToggling(member)}
                        >
                          {member.isActive ? 'Deactivate' : 'Reactivate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MemberFormDialog open={editing !== null} member={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={Boolean(toggling)}
        tone={deactivating ? 'danger' : 'primary'}
        title={deactivating ? `Deactivate ${toggling?.name}?` : `Reactivate ${toggling?.name}?`}
        message={
          deactivating
            ? 'They drop off the leaderboard. Their history is kept, and reactivating brings their score back.'
            : 'They return to the leaderboard with their full score.'
        }
        confirmLabel={deactivating ? 'Deactivate' : 'Reactivate'}
        loading={setActive.isPending}
        onConfirm={() => setActive.mutate({ id: toggling.id, isActive: !toggling.isActive })}
        onCancel={() => setToggling(null)}
      />
    </>
  )
}
