import { ListChecks } from 'lucide-react'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import PointsChip from '@/components/ui/PointsChip'
import Skeleton from '@/components/ui/Skeleton'
import { useMemberHistory } from '@/hooks/useBoard'
import { formatDateTime, plural } from '@/lib/format'

/** A member's full history, newest first, 20 at a time. */
export default function MemberHistory({ memberId }) {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMemberHistory(memberId)
  const items = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">History</h3>
        {total > 0 && <span className="text-xs text-muted">{plural(total, 'entry', 'entries')}</span>}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Couldn't load history"
          action={
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No entries yet"
          description="Rewards and penalties will be listed here as they come in."
          className="py-8"
        />
      ) : (
        <ol className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 rounded-xl border border-line px-3 py-2.5">
              <PointsChip points={item.points} size="sm" className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.ruleLabel}</p>
                {item.note && <p className="mt-0.5 text-xs italic text-muted">“{item.note}”</p>}
              </div>
              <time dateTime={item.createdAt} className="shrink-0 pt-0.5 text-[11px] text-muted">
                {formatDateTime(item.createdAt)}
              </time>
            </li>
          ))}
        </ol>
      )}

      {hasNextPage && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-3 w-full"
          loading={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          Load more
        </Button>
      )}
    </section>
  )
}
