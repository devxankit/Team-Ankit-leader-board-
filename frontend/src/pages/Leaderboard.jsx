import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Gift, Trophy, Users } from 'lucide-react'
import ActivityFeed from '@/components/leaderboard/ActivityFeed'
import LevelRoad from '@/components/leaderboard/LevelRoad'
import LiveIndicator from '@/components/leaderboard/LiveIndicator'
import MemberDrawer from '@/components/leaderboard/MemberDrawer'
import OutcomesSheet from '@/components/leaderboard/OutcomesSheet'
import Podium from '@/components/leaderboard/Podium'
import Standings from '@/components/leaderboard/Standings'
import Button from '@/components/ui/Button'
import ButtonLink from '@/components/ui/ButtonLink'
import EmptyState from '@/components/ui/EmptyState'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useLeaderboard } from '@/hooks/useBoard'
import { PERIOD_LABELS } from '@/lib/format'

const PERIODS = ['all', 'month', 'week']
const PERIOD_OPTIONS = PERIODS.map((value) => ({ value, label: PERIOD_LABELS[value] }))
const EMPTY_PERIOD_TEXT = { all: 'yet', month: 'this month yet', week: 'this week yet' }

function rangeLabel(period, from) {
  if (period === 'all' || !from) return 'Every point since day one'
  const start = new Date(from)
  if (period === 'month') return start.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  return `Since ${start.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-72" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const { user, isAdmin } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const period = PERIODS.includes(searchParams.get('period')) ? searchParams.get('period') : 'all'
  const [selectedId, setSelectedId] = useState(null)
  const [showOutcomes, setShowOutcomes] = useState(false)
  const { data, isLoading, isError, refetch } = useLeaderboard(period)

  const rows = data?.rows ?? []
  const hasPoints = rows.some((row) => row.points !== 0)
  const selectedRow = rows.find((row) => row.member.id === selectedId) ?? null

  const setPeriod = (next) =>
    setSearchParams(next === 'all' ? {} : { period: next }, { replace: true })

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide sm:text-5xl">Leaderboard</h1>
            <LiveIndicator />
          </div>
          <p className="mt-1 text-sm text-muted">{rangeLabel(period, data?.range?.from)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => setShowOutcomes(true)}>
            <Gift className="size-4 text-gold" /> What's at stake
          </Button>
          <SegmentedControl label="Period" options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
        </div>
      </header>

      {isLoading ? (
        <LeaderboardSkeleton />
      ) : isError ? (
        <div className="card">
          <EmptyState
            title="Couldn't load the leaderboard"
            description="Check your connection and try again."
            action={<Button onClick={() => refetch()}>Try again</Button>}
          />
        </div>
      ) : rows.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No one on the board yet"
            description={
              isAdmin
                ? 'Add your team in the admin panel, then give the first points.'
                : 'The team will show up here as soon as the admin adds everyone. Check back soon.'
            }
            action={
              isAdmin && (
                <ButtonLink to="/admin/members">Add members</ButtonLink>
              )
            }
          />
        </div>
      ) : (
        <>
          {hasPoints ? (
            <Podium rows={rows.slice(0, 3)} meId={user?.id} onSelect={setSelectedId} />
          ) : (
            <div className="card">
              <EmptyState
                icon={Trophy}
                title={`No points ${EMPTY_PERIOD_TEXT[period]}`}
                description="The podium fills up as soon as the first points land."
                action={
                  isAdmin && (
                    <ButtonLink to="/admin/points">Give points</ButtonLink>
                  )
                }
              />
            </div>
          )}

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Standings rows={rows} meId={user?.id} periodLabel={PERIOD_LABELS[period]} onSelect={setSelectedId} />
            <ActivityFeed onSelect={setSelectedId} />
          </div>

          <LevelRoad levels={data.levels} rows={rows} onSelect={setSelectedId} />
        </>
      )}

      <MemberDrawer row={selectedRow} periodLabel={PERIOD_LABELS[period]} onClose={() => setSelectedId(null)} />
      <OutcomesSheet open={showOutcomes} onClose={() => setShowOutcomes(false)} />
    </div>
  )
}
