import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Users } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'

/** Dropdown with search, "Select all" and a checkbox per member. */
export default function MemberMultiSelect({ id, members, selected, onChange, error }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => !ref.current?.contains(event.target) && setOpen(false)
    const onKeyDown = (event) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const chosen = members.filter((member) => selected.has(member.id))
  const allSelected = members.length > 0 && chosen.length === members.length
  const needle = query.trim().toLowerCase()
  const visible = needle
    ? members.filter((member) => `${member.name} ${member.designation}`.toLowerCase().includes(needle))
    : members

  const summary =
    chosen.length === 0
      ? null
      : allSelected
        ? `Everyone (${members.length})`
        : chosen.length <= 2
          ? chosen.map((member) => member.name).join(', ')
          : `${chosen[0].name}, ${chosen[1].name} +${chosen.length - 2} more`

  const toggle = (memberId) => {
    const next = new Set(selected)
    if (next.has(memberId)) next.delete(memberId)
    else next.add(memberId)
    onChange(next)
  }

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-xl border bg-surface px-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-accent/35',
          error ? 'border-penalty' : 'border-line hover:border-muted/60'
        )}
      >
        <Users className="size-4 shrink-0 text-muted" />
        <span className={cn('min-w-0 flex-1 truncate', !summary && 'text-muted/80')}>{summary ?? 'Select members'}</span>
        {chosen.length > 0 && (
          <span className="rounded-full bg-accent/12 px-2 py-0.5 text-xs font-semibold text-accent">{chosen.length}</span>
        )}
        <ChevronDown className={cn('size-4 shrink-0 text-muted transition', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full animate-fade-in overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
          <div className="border-b border-line p-2">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search members"
              aria-label="Search members"
              className="h-9 w-full rounded-lg bg-subtle px-3 text-sm placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/35"
              autoFocus
            />
          </div>
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onChange(allSelected ? new Set() : new Set(members.map((member) => member.id)))}
                className="size-4 accent-accent"
              />
              Select all
            </label>
            {chosen.length > 0 && (
              <button type="button" onClick={() => onChange(new Set())} className="text-xs font-medium text-muted hover:text-ink">
                Clear
              </button>
            )}
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {visible.map((member) => (
              <li key={member.id}>
                <label className="flex cursor-pointer items-center gap-3 px-3 py-2 transition hover:bg-subtle">
                  <input
                    type="checkbox"
                    checked={selected.has(member.id)}
                    onChange={() => toggle(member.id)}
                    className="size-4 accent-accent"
                  />
                  <Avatar name={member.name} color={member.avatarColor} size="xs" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{member.name}</span>
                    {member.designation && <span className="block truncate text-xs text-muted">{member.designation}</span>}
                  </span>
                </label>
              </li>
            ))}
            {visible.length === 0 && <li className="px-3 py-4 text-center text-sm text-muted">No members match “{query}”.</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
