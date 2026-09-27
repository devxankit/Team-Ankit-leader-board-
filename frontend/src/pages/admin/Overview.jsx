import { Link } from 'react-router-dom'
import { Activity, Gift, TrendingDown, TrendingUp, UserPlus, Users } from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import RecentEntries from '@/components/admin/RecentEntries'
import StatCard from '@/components/admin/StatCard'
import LevelBadge from '@/components/leaderboard/LevelBadge'
import Avatar from '@/components/ui/Avatar'
import ButtonLink from '@/components/ui/ButtonLink'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useLeaderboard } from '@/hooks/useBoard'
import { firstName, formatTotal } from '@/lib/format'

function greeting() {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}

export default function Overview() {
  const { user } = useAuth()
  const { data, isLoading } = useLeaderboard('week')
  const rows = data?.rows ?? []
  const totals = rows.reduce(
    (sum, row) => ({
      points: sum.points + row.points,
      rewards: sum.rewards + row.rewards,
      penalties: sum.penalties + row.penalties,
    }),
    { points: 0, rewards: 0, penalties: 0 }
  )
  const onFire = rows.filter((row) => row.onFire).length

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${firstName(user.name)}`}
        description="Here's how the team is doing this week."
        actions={
          <>
            <ButtonLink to="/admin/members" variant="secondary">
              <UserPlus className="size-4" /> Add member
            </ButtonLink>
            <ButtonLink to="/admin/points">
              <Gift className="size-4" /> Give points
            </ButtonLink>
          </>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Active members" value={rows.length} hint={`${onFire} on fire 🔥`} icon={Users} />
          <StatCard label="Net points this week" value={formatTotal(totals.points)} icon={Activity} tone="gold" />
          <StatCard label="Rewards this week" value={totals.rewards} icon={TrendingUp} tone="reward" />
          <StatCard label="Penalties this week" value={totals.penalties} icon={TrendingDown} tone="penalty" />
        </div>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <section className="card overflow-hidden">
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold">Top this week</h2>
            <Link to="/?period=week" className="text-xs font-medium text-accent hover:underline">
              View leaderboard
            </Link>
          </header>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">No members yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {rows.slice(0, 5).map((row) => (
                  <tr key={row.member.id}>
                    <td className="w-12 py-2.5 pl-4 font-semibold text-muted tabular">#{row.rank}</td>
                    <td className="py-2.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar name={row.member.name} color={row.member.avatarColor} size="xs" />
                        <span className="truncate font-medium">{row.member.name}</span>
                      </div>
                    </td>
                    <td className="hidden py-2.5 sm:table-cell">
                      <LevelBadge level={row.level} />
                    </td>
                    <td className="py-2.5 pr-4 text-right font-semibold tabular">{formatTotal(row.points)} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <RecentEntries />
      </div>
    </>
  )
}
