import { Shield } from 'lucide-react'
import MemberHistory from '@/components/leaderboard/MemberHistory'
import MemberSummary from '@/components/leaderboard/MemberSummary'
import Avatar from '@/components/ui/Avatar'
import ButtonLink from '@/components/ui/ButtonLink'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useLeaderboard } from '@/hooks/useBoard'

export default function MyProfile() {
  const { user, isAdmin } = useAuth()
  const { data, isLoading } = useLeaderboard('all')
  const row = data?.rows.find((entry) => entry.member.id === user.id)

  if (isAdmin) {
    return (
      <div className="card">
        <EmptyState
          icon={Shield}
          title="Admins aren't ranked"
          description="You run the game. Head to the admin panel to give points."
          action={
            <ButtonLink to="/admin">Open admin panel</ButtonLink>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="card flex items-center gap-4 p-5">
        <Avatar name={user.name} color={user.avatarColor} size="xl" />
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl font-extrabold uppercase tracking-wide">{user.name}</h1>
          <p className="truncate text-muted">{user.designation || 'Team member'}</p>
        </div>
      </header>

      {isLoading ? <Skeleton className="h-64" /> : row && <MemberSummary row={row} periodLabel="Points" />}

      <div className="card p-5">
        <MemberHistory memberId={user.id} />
      </div>
    </div>
  )
}
