import { useState } from 'react'
import { Check, Search } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'

/** Multi-select of active members with search and "Select everyone". */
export default function MemberPicker({ members, selected, onChange }) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const visible = needle
    ? members.filter((m) => `${m.name} ${m.designation}`.toLowerCase().includes(needle))
    : members
  const everyoneSelected = members.length > 0 && members.every((m) => selected.has(m.id))

  const toggle = (id) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search people</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people"
            className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/35"
          />
        </label>
        <button
          type="button"
          role="checkbox"
          aria-checked={everyoneSelected}
          onClick={() => onChange(everyoneSelected ? new Set() : new Set(members.map((m) => m.id)))}
          className={cn(
            'flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition',
            everyoneSelected ? 'border-accent bg-accent/10 text-accent' : 'border-line hover:bg-subtle'
          )}
        >
          <Check className="size-4" strokeWidth={3} /> Select everyone
        </button>
      </div>

      <p className="mt-2 text-xs font-medium text-muted">
        {selected.size} of {members.length} selected
      </p>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((member) => {
          const on = selected.has(member.id)
          return (
            <li key={member.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(member.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition',
                  on ? 'border-accent bg-accent/10' : 'border-line hover:bg-subtle'
                )}
              >
                <Avatar name={member.name} color={member.avatarColor} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{member.name}</span>
                  <span className="block truncate text-xs text-muted">{member.designation || 'Team member'}</span>
                </span>
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-md border transition',
                    on ? 'border-accent bg-accent text-accent-ink' : 'border-line'
                  )}
                >
                  {on && <Check className="size-3.5" strokeWidth={3} />}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {visible.length === 0 && <p className="py-6 text-center text-sm text-muted">No one matches “{query}”.</p>}
    </div>
  )
}
