import { useSocket } from '@/hooks/useSocket'
import { cn } from '@/lib/cn'

export default function LiveIndicator() {
  const { connected } = useSocket()
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted"
      title={connected ? 'Scores update live' : 'Reconnecting… scores will refresh when back online'}
    >
      <span className="relative flex size-2">
        {connected && <span className="absolute inline-flex size-full animate-ping rounded-full bg-reward opacity-60" />}
        <span className={cn('relative inline-flex size-2 rounded-full', connected ? 'bg-reward' : 'bg-muted')} />
      </span>
      {connected ? 'Live' : 'Offline'}
    </span>
  )
}
