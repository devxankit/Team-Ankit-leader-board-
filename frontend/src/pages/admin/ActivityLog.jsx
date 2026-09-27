import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import { SelectInput, TextInput } from '@/components/ui/Field'
import PointsChip from '@/components/ui/PointsChip'
import Skeleton from '@/components/ui/Skeleton'
import { useAdminAction, useAdminEvents, useAdminMembers, useAdminRules } from '@/hooks/useAdmin'
import { cn } from '@/lib/cn'
import { formatDateTime, formatPoints, plural } from '@/lib/format'
import { adminService } from '@/services/adminService'

const EMPTY_FILTERS = { member: '', rule: '', type: '', status: 'all', from: '', to: '' }
const PAGE_SIZE = 25

function FilterSelect({ label, value, onChange, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <SelectInput value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </SelectInput>
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

  const setFilter = (key) => (value) => {
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

  return (
    <div className="space-y-4">
      <section className="card grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
        <FilterSelect label="Member" value={filters.member} onChange={setFilter('member')}>
          <option value="">Everyone</option>
          {(members.data ?? []).map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
              {!member.isActive ? ' (inactive)' : ''}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Rule" value={filters.rule} onChange={setFilter('rule')}>
          <option value="">Any rule</option>
          <option value="custom">Custom entries</option>
          {(rules.data ?? []).map((rule) => (
            <option key={rule.id} value={rule.id}>
              {rule.label} ({formatPoints(rule.points)}){!rule.isActive ? ' · archived' : ''}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Type" value={filters.type} onChange={setFilter('type')}>
          <option value="">Rewards & penalties</option>
          <option value="reward">Rewards only</option>
          <option value="penalty">Penalties only</option>
        </FilterSelect>
        <FilterSelect label="Status" value={filters.status} onChange={setFilter('status')}>
          <option value="all">All entries</option>
          <option value="active">Live</option>
          <option value="voided">Reversed</option>
        </FilterSelect>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">From</span>
          <TextInput type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => setFilter('from')(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">To</span>
          <TextInput type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => setFilter('to')(e.target.value)} />
        </label>
      </section>

      <div className="flex items-center justify-between text-sm text-muted">
        <span>{data ? plural(data.total, 'entry', 'entries') : ' '}</span>
        {filtered && (
          <button type="button" className="font-semibold text-accent" onClick={() => { setFilters(EMPTY_FILTERS); setPage(1) }}>
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={CalendarDays}
            title={filtered ? 'No entries match these filters' : 'No entries yet'}
            description={filtered ? 'Try widening the dates or clearing a filter.' : 'Points you give or take will be logged here.'}
          />
        </div>
      ) : (
        <ul className={cn('card divide-y divide-line overflow-hidden transition-opacity', isFetching && 'opacity-70')}>
          {items.map((event) => (
            <li key={event.id} className={cn('flex flex-wrap items-start gap-3 px-4 py-3 sm:flex-nowrap sm:items-center sm:px-5', event.isVoided && 'bg-subtle/50')}>
              <PointsChip points={event.points} className={cn('mt-0.5 sm:mt-0', event.isVoided && 'line-through opacity-60')} />
              <Avatar name={event.member.name} color={event.member.avatarColor} size="sm" className="hidden sm:inline-flex" />
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm', event.isVoided && 'text-muted line-through')}>
                  <span className="font-semibold">{event.member.name}</span> · {event.ruleLabel}
                  {!event.rule && <span className="ml-1 rounded bg-subtle px-1 text-[10px] font-bold uppercase text-muted no-underline">custom</span>}
                </p>
                {event.note && <p className="truncate text-xs italic text-muted">“{event.note}”</p>}
                <p className="mt-0.5 text-[11px] text-muted">
                  {formatDateTime(event.createdAt)}
                  {event.givenBy && ` · by ${event.givenBy.name}`}
                  {event.isVoided &&
                    ` · reversed${event.voidedBy ? ` by ${event.voidedBy.name}` : ''} ${event.voidedAt ? formatDateTime(event.voidedAt) : ''}`}
                </p>
              </div>
              {event.isVoided ? (
                <span className="ml-auto shrink-0 rounded-lg bg-subtle px-2 py-1 text-xs font-semibold text-muted">Reversed</span>
              ) : (
                <Button variant="secondary" size="sm" className="ml-auto" onClick={() => setReversing(event)}>
                  <Undo2 className="size-3.5" /> Reverse
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <nav className="flex items-center justify-center gap-3" aria-label="Pagination">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="size-4" /> Newer
          </Button>
          <span className="text-sm tabular text-muted">
            Page {data.page} of {data.totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
            Older <ChevronRight className="size-4" />
          </Button>
        </nav>
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
    </div>
  )
}
