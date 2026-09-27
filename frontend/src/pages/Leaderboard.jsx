import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Trophy, Users } from 'lucide-react'
import ActivityFeed from '@/components/leaderboard/ActivityFeed'
import Awards from '@/components/leaderboard/Awards'
import Celebration from '@/components/leaderboard/Celebration'
import LevelRoad from '@/components/leaderboard/LevelRoad'
import LiveIndicator from '@/components/leaderboard/LiveIndicator'
import MemberDrawer from '@/components/leaderboard/MemberDrawer'
import Podium from '@/components/leaderboard/Podium'
import Standings from '@/components/leaderboard/Standings'
import Button from '@/components/ui/Button'
import ButtonLink from '@/components/ui/ButtonLink'
import EmptyState from '@/components/ui/EmptyState'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useLeaderboard } from '@/hooks/useBoard'
import { useLiveChanges } from '@/hooks/useLiveChanges'
import { PERIOD_LABELS } from '@/lib/format'

const PERIODS = ['all', 'month', 'week']
const PERIOD_OPTIONS = PERIODS.map((value) => ({ value, label: PERIOD_LABELS[value] }))
const EMPTY_PERIOD_TEXT = { all: 'yet', month: 'this month yet', week: 'this week yet' }

function rangeLabel(period, from) {
  if (period === 'all' || !from) return 'Every point since day one'
  const start = new Date(from)
  if (period === 'month') return start.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  return `Since ${start.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}`
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-8" aria-hidden="true">
      <Skeleton className="h-80" />
      <Skeleton className="h-36" />
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
  const { data, isLoading, isError, refetch } = useLeaderboard(period)
  const { deltas, moment, clearMoment } = useLiveChanges(data)

  const rows = data?.rows ?? []
  const hasPoints = rows.some((row) => row.points !== 0)
  const selectedRow = rows.find((row) => row.member.id === selectedId) ?? null
  const periodLabel = PERIOD_LABELS[period]

  const setPeriod = (next) => setSearchParams(next === 'all' ? {} : { period: next }, { replace: true })

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.3em] text-accent">
            <Trophy className="size-4" /> Team Ankit · Season standings
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="bg-gradient-to-br from-ink via-ink to-accent bg-clip-text font-display text-6xl font-black uppercase leading-[0.85] tracking-wide text-transparent drop-shadow-[0_0_28px_color-mix(in_oklab,var(--accent)_30%,transparent)] sm:text-7xl">
              Leaderboard
            </h1>
            <LiveIndicator />
          </div>
          <p className="mt-2 text-sm font-medium text-muted">{rangeLabel(period, data?.range?.from)}</p>
        </div>
        <SegmentedControl label="Period" options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
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
            action={isAdmin && <ButtonLink to="/admin/members">Add members</ButtonLink>}
          />
        </div>
      ) : (
        <>
          {hasPoints ? (
            <Podium rows={rows.slice(0, 3)} meId={user?.id} deltas={deltas} onSelect={setSelectedId} />
          ) : (
            <div className="card">
              <EmptyState
                icon={Trophy}
                title={`No points ${EMPTY_PERIOD_TEXT[period]}`}
                description="The podium fills up as soon as the first points land."
                action={isAdmin && <ButtonLink to="/admin/points">Give points</ButtonLink>}
              />
            </div>
          )}

          <Awards rows={rows} periodLabel={periodLabel} onSelect={setSelectedId} />

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Standings rows={rows} meId={user?.id} deltas={deltas} periodLabel={periodLabel} onSelect={setSelectedId} />
            <ActivityFeed onSelect={setSelectedId} />
          </div>

          <LevelRoad levels={data.levels} rows={rows} onSelect={setSelectedId} />
        </>
      )}

      <MemberDrawer row={selectedRow} periodLabel={periodLabel} onClose={() => setSelectedId(null)} />
      <Celebration moment={moment} onDone={clearMoment} />
    </div>
  )
}
