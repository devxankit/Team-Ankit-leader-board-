import Avatar from '@/components/ui/Avatar'
import Dialog from '@/components/ui/Dialog'
import MemberHistory from './MemberHistory'
import MemberSummary from './MemberSummary'

/** Opens when a member is clicked on the podium, standings or feed. */
export default function MemberDrawer({ row, periodLabel, onClose }) {
  return (
    <Dialog
      open={Boolean(row)}
      onClose={onClose}
      variant="drawer"
      header={
        row && (
          <div className="flex items-center gap-3">
            <Avatar name={row.member.name} color={row.member.avatarColor} size="md" />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold">{row.member.name}</h2>
              <p className="truncate text-sm text-muted">{row.member.designation || 'Team member'}</p>
            </div>
          </div>
        )
      }
    >
      {row && (
        <div className="space-y-6">
          <MemberSummary row={row} periodLabel={periodLabel} />
          <MemberHistory memberId={row.member.id} />
        </div>
      )}
    </Dialog>
  )
}
