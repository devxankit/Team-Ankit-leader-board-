import { Crown } from 'lucide-react'

export default function Logo({ compact = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#8b7dff] to-[#4f46e5] shadow-md shadow-indigo-500/25">
        <Crown className="size-5 text-amber-300" strokeWidth={2.5} aria-hidden="true" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-xl font-extrabold tracking-wider">TEAM ANKIT</span>
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">
            Leaderboard
          </span>
        </span>
      )}
    </span>
  )
}
