import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/admin/PageHeader'
import StatusBadge from '@/components/admin/StatusBadge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import { SelectInput, TextInput } from '@/components/ui/Field'
import PointsChip from '@/components/ui/PointsChip'
import Skeleton from '@/components/ui/Skeleton'
import { useAdminAction, useAdminEvents, useAdminMembers, useAdminRules } from '@/hooks/useAdmin'
import { cn } from '@/lib/cn'
import { formatDateTime, formatPoints } from '@/lib/format'
import { adminService } from '@/services/adminService'

const EMPTY_FILTERS = { member: '', rule: '', type: '', status: 'all', from: '', to: '' }
const PAGE_SIZE = 25

function Filter({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  )
}

export default function ActivityLog() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [reversing, setReversing] = useState(null)
  const members = useAdminMembers('all')
  const rules = useAdminRules('all')
  const { data, isLoading, isFetching } = useAdminEvents({ ...filters, page, limit: PAGE_SIZE })

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }
  const filtered = Object.entries(filters).some(([key, value]) => value !== EMPTY_FILTERS[key])

  const reverse = useAdminAction(adminService.voidEvent, {
    onSuccess: () => {
      toast.success('Entry reversed')
      setReversing(null)
    },
  })

  const items = data?.items ?? []
  const first = data ? (data.page - 1) * data.limit + 1 : 0
  const last = data ? Math.min(data.page * data.limit, data.total) : 0

  return (
    <>
      <PageHeader title="Activity log" description="Every entry, including reversed ones. Reverse a mistake and the score corrects itself." />

      <div className="card mb-4 grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
        <Filter label="Member">
          <SelectInput value={filters.member} onChange={(event) => setFilter('member', event.target.value)}>
            <option value="">Everyone</option>
            {(members.data ?? []).map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
                {member.isActive ? '' : ' (inactive)'}
              </option>
            ))}
          </SelectInput>
        </Filter>
        <Filter label="Reason">
          <SelectInput value={filters.rule} onChange={(event) => setFilter('rule', event.target.value)}>
            <option value="">Any reason</option>
            <option value="custom">Custom entries</option>
            {(rules.data ?? []).map((rule) => (
              <option key={rule.id} value={rule.id}>
                {rule.label}
                {rule.isActive ? '' : ' (archived)'}
              </option>
            ))}
          </SelectInput>
        </Filter>
        <Filter label="Type">
          <SelectInput value={filters.type} onChange={(event) => setFilter('type', event.target.value)}>
            <option value="">All types</option>
            <option value="reward">Rewards</option>
            <option value="penalty">Penalties</option>
          </SelectInput>
        </Filter>
        <Filter label="Status">
          <SelectInput value={filters.status} onChange={(event) => setFilter('status', event.target.value)}>
            <option value="all">All</option>
            <option value="active">Live</option>
            <option value="voided">Reversed</option>
          </SelectInput>
        </Filter>
        <Filter label="From">
          <TextInput type="date" value={filters.from} max={filters.to || undefined} onChange={(event) => setFilter('from', event.target.value)} />
        </Filter>
        <Filter label="To">
          <TextInput type="date" value={filters.to} min={filters.from || undefined} onChange={(event) => setFilter('to', event.target.value)} />
        </Filter>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={CalendarDays}
            title={filtered ? 'No entries match these filters' : 'No entries yet'}
            description={filtered ? 'Try widening the dates or clearing a filter.' : 'Points you give or take will be logged here.'}
            action={
              filtered && (
                <Button variant="secondary" onClick={() => { setFilters(EMPTY_FILTERS); setPage(1) }}>
                  Clear filters
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className={cn('card overflow-hidden transition-opacity', isFetching && 'opacity-70')}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-line bg-subtle/50 text-left text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 text-right font-medium">Points</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((event) => (
                  <tr key={event.id} className={cn('transition hover:bg-subtle/40', event.isVoided && 'text-muted')}>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDateTime(event.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={event.member.name} color={event.member.avatarColor} size="xs" />
                        <span className="whitespace-nowrap font-medium">{event.member.name}</span>
                      </div>
                    </td>
                    <td className="max-w-72 px-4 py-3">
                      <p className={cn(event.isVoided && 'line-through')}>
                        {event.ruleLabel}
                        {!event.rule && <span className="ml-1.5 rounded bg-subtle px-1 text-[10px] font-semibold uppercase text-muted">custom</span>}
                      </p>
                      {event.note && <p className="truncate text-xs italic text-muted">“{event.note}”</p>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PointsChip points={event.points} size="sm" className={cn(event.isVoided && 'line-through opacity-50')} />
                    </td>
                    <td className="px-4 py-3">
                      {event.isVoided ? (
                        <span title={event.voidedAt ? `Reversed ${formatDateTime(event.voidedAt)}` : undefined}>
                          <StatusBadge>Reversed</StatusBadge>
                        </span>
                      ) : (
                        <StatusBadge tone="green">Live</StatusBadge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!event.isVoided && (
                        <Button variant="ghost" size="sm" onClick={() => setReversing(event)}>
                          Reverse
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-muted sm:flex-row">
            <span className="tabular">
              Showing {first}–{last} of {data.total}
              {filtered && (
                <button type="button" className="ml-3 font-medium text-accent hover:underline" onClick={() => { setFilters(EMPTY_FILTERS); setPage(1) }}>
                  Clear filters
                </button>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="size-4" /> Previous
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(reversing)}
        title="Reverse this entry?"
        message={
          reversing && (
            <>
              <strong className="text-ink">
                {formatPoints(reversing.points)} “{reversing.ruleLabel}”
              </strong>{' '}
              for <strong className="text-ink">{reversing.member.name}</strong> will stop counting, so their score changes by{' '}
              {formatPoints(-reversing.points)}. The entry stays in this log marked as reversed.
            </>
          )
        }
        confirmLabel="Reverse entry"
        loading={reverse.isPending}
        onConfirm={() => reverse.mutate(reversing.id)}
        onCancel={() => setReversing(null)}
      />
    </>
  )
}
