import { useState } from 'react'
import { KeyRound, Pencil, UserCheck, UserPlus, Users, UserX } from 'lucide-react'
import { toast } from 'sonner'
import MemberFormDialog from '@/components/admin/MemberFormDialog'
import ResetPasswordDialog from '@/components/admin/ResetPasswordDialog'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Skeleton from '@/components/ui/Skeleton'
import { useAdminAction, useAdminMembers } from '@/hooks/useAdmin'
import { cn } from '@/lib/cn'
import { adminService } from '@/services/adminService'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'all', label: 'All' },
]

export default function Members() {
  const [status, setStatus] = useState('active')
  const { data: members = [], isLoading } = useAdminMembers(status)
  const [editing, setEditing] = useState(null) // a member, 'new', or null
  const [resetting, setResetting] = useState(null)
  const [toggling, setToggling] = useState(null)

  const setActive = useAdminAction(({ id, isActive }) => adminService.setMemberStatus(id, isActive), {
    onSuccess: (member) => {
      toast.success(member.isActive ? `${member.name} reactivated` : `${member.name} deactivated`)
      setToggling(null)
    },
  })

  const deactivating = toggling?.isActive

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl label="Show members" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        <Button onClick={() => setEditing('new')}>
          <UserPlus className="size-4" /> Add member
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-80" />
      ) : members.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title={status === 'inactive' ? 'No inactive members' : 'No team members yet'}
            description={
              status === 'inactive'
                ? 'Deactivated members show up here, with their history kept.'
                : 'Add your team so they can sign in and appear on the leaderboard.'
            }
            action={status !== 'inactive' && <Button onClick={() => setEditing('new')}>Add the first member</Button>}
          />
        </div>
      ) : (
        <ul className="card divide-y divide-line overflow-hidden">
          {members.map((member) => (
            <li key={member.id} className={cn('flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:px-5', !member.isActive && 'bg-subtle/40')}>
              <Avatar name={member.name} color={member.avatarColor} size="md" className={cn(!member.isActive && 'grayscale')} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate font-semibold">{member.name}</p>
                  {!member.isActive && (
                    <span className="rounded-md bg-penalty-soft px-1.5 py-px text-[10px] font-bold uppercase text-penalty">
                      Inactive
                    </span>
                  )}
                  {member.isActive && member.mustChangePassword && (
                    <span
                      className="rounded-md bg-gold/15 px-1.5 py-px text-[10px] font-bold uppercase text-gold"
                      title="Still on the temporary password"
                    >
                      Temp password
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted">
                  {member.email}
                  {member.designation && ` · ${member.designation}`}
                </p>
              </div>
              <div className="flex w-full justify-end gap-1 sm:w-auto">
                <Button variant="ghost" size="icon" onClick={() => setEditing(member)} aria-label={`Edit ${member.name}`} title="Edit">
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setResetting(member)}
                  disabled={!member.isActive}
                  aria-label={`Reset password for ${member.name}`}
                  title="Reset password"
                >
                  <KeyRound className="size-4" />
                </Button>
                {member.isActive ? (
                  <Button variant="ghost" size="icon" onClick={() => setToggling(member)} aria-label={`Deactivate ${member.name}`} title="Deactivate">
                    <UserX className="size-4 text-penalty" />
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => setToggling(member)}>
                    <UserCheck className="size-4" /> Reactivate
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <MemberFormDialog
        open={editing !== null}
        member={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
      />
      <ResetPasswordDialog member={resetting} onClose={() => setResetting(null)} />
      <ConfirmDialog
        open={Boolean(toggling)}
        tone={deactivating ? 'danger' : 'primary'}
        title={deactivating ? `Deactivate ${toggling?.name}?` : `Reactivate ${toggling?.name}?`}
        message={
          deactivating
            ? 'They are signed out at once and drop off the leaderboard. Their history is kept, and reactivating brings their score back.'
            : 'They can sign in again and return to the leaderboard with their full score.'
        }
        confirmLabel={deactivating ? 'Deactivate' : 'Reactivate'}
        loading={setActive.isPending}
        onConfirm={() => setActive.mutate({ id: toggling.id, isActive: !toggling.isActive })}
        onCancel={() => setToggling(null)}
      />
    </div>
  )
}
