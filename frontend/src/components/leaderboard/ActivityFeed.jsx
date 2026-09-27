import { Sparkles } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { useActivity } from '@/hooks/useBoard'
import { useNow } from '@/hooks/useNow'
import { cn } from '@/lib/cn'
import { firstName, formatDateTime, formatPoints, timeAgo } from '@/lib/format'

/** "+10 Priya · Task completed · “note” · 2h ago" — the last 40 entries, live. */
export default function ActivityFeed({ onSelect }) {
  const { data: items = [], isLoading, isError, refetch } = useActivity()
  const now = useNow()

  return (
    <section className="card flex max-h-[32rem] flex-col overflow-hidden lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)]" aria-label="Latest activity">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-semibold">Latest activity</h2>
        {items.length > 0 && <span className="text-xs text-muted">Last {items.length}</span>}
      </header>

      {isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Couldn't load activity"
          action={
            <button type="button" onClick={() => refetch()} className="text-sm font-semibold text-accent">
              Try again
            </button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No activity yet"
          description="Every reward and penalty shows up here the moment your admin gives it."
        />
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.member.id)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-subtle/70"
              >
                <Avatar name={item.member.name} color={item.member.avatarColor} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className={cn('font-extrabold tabular', item.points > 0 ? 'text-reward' : 'text-penalty')}>
                      {formatPoints(item.points)}
                    </span>{' '}
                    <span className="font-semibold">{firstName(item.member.name)}</span>
                    <span className="text-muted"> · {item.ruleLabel}</span>
                  </p>
                  {item.note && <p className="mt-0.5 line-clamp-2 text-xs italic text-muted">“{item.note}”</p>}
                </div>
                <time
                  dateTime={item.createdAt}
                  title={formatDateTime(item.createdAt)}
                  className="shrink-0 pt-0.5 text-[11px] text-muted"
                >
                  {timeAgo(item.createdAt, now)}
                </time>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
