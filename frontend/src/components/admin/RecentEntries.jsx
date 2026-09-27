import { Link } from 'react-router-dom'
import PointsChip from '@/components/ui/PointsChip'
import Skeleton from '@/components/ui/Skeleton'
import { useAdminEvents } from '@/hooks/useAdmin'
import { useNow } from '@/hooks/useNow'
import { cn } from '@/lib/cn'
import { timeAgo } from '@/lib/format'

/** The latest ledger entries, newest first, with a link to the full log. */
export default function RecentEntries({ title = 'Recent entries', limit = 6 }) {
  const { data, isLoading } = useAdminEvents({ page: 1, limit })
  const now = useNow()
  const items = data?.items ?? []

  return (
    <section className="card overflow-hidden">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link to="/admin/activity" className="text-xs font-medium text-accent hover:underline">
          View all
        </Link>
      </header>
      {isLoading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-9" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted">Nothing given yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((event) => (
            <li key={event.id} className="flex items-center gap-3 px-4 py-2.5">
              <PointsChip points={event.points} size="sm" className={cn(event.isVoided && 'line-through opacity-50')} />
              <p className={cn('min-w-0 flex-1 truncate text-sm', event.isVoided && 'text-muted line-through')}>
                <span className="font-medium">{event.member.name}</span>
                <span className="text-muted"> · {event.ruleLabel}</span>
              </p>
              <span className="shrink-0 text-xs text-muted">{event.isVoided ? 'Reversed' : timeAgo(event.createdAt, now)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
