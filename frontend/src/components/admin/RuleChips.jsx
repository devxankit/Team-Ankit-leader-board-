import { PenLine } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatPoints } from '@/lib/format'

function Chip({ active, tone, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition',
        active
          ? tone === 'reward'
            ? 'border-reward bg-reward-soft ring-2 ring-reward/25'
            : tone === 'penalty'
              ? 'border-penalty bg-penalty-soft ring-2 ring-penalty/25'
              : 'border-accent bg-accent/10 ring-2 ring-accent/25'
          : 'border-line bg-surface hover:bg-subtle'
      )}
    >
      {children}
    </button>
  )
}

function Group({ title, tone, children }) {
  return (
    <div>
      <p
        className={cn(
          'mb-2 text-xs font-bold uppercase tracking-wider',
          tone === 'reward' ? 'text-reward' : tone === 'penalty' ? 'text-penalty' : 'text-muted'
        )}
      >
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

/** Rewards and penalties as +/− coloured chips, plus a custom one-off entry. */
export default function RuleChips({ rules, choice, onChoose }) {
  const isActive = (rule) => choice?.kind === 'rule' && choice.rule.id === rule.id
  const renderRule = (rule) => {
    const tone = rule.points > 0 ? 'reward' : 'penalty'
    return (
      <Chip key={rule.id} tone={tone} active={isActive(rule)} onClick={() => onChoose({ kind: 'rule', rule })}>
        {rule.icon && <span aria-hidden="true">{rule.icon}</span>}
        {rule.label}
        <span className={cn('font-extrabold tabular', tone === 'reward' ? 'text-reward' : 'text-penalty')}>
          {formatPoints(rule.points)}
        </span>
      </Chip>
    )
  }

  const rewards = rules.filter((rule) => rule.points > 0)
  const penalties = rules.filter((rule) => rule.points < 0)

  return (
    <div className="space-y-5">
      {rewards.length > 0 && (
        <Group title="Rewards" tone="reward">
          {rewards.map(renderRule)}
        </Group>
      )}
      {penalties.length > 0 && (
        <Group title="Penalties" tone="penalty">
          {penalties.map(renderRule)}
        </Group>
      )}
      <Group title="One-off">
        <Chip active={choice?.kind === 'custom'} onClick={() => onChoose({ kind: 'custom' })}>
          <PenLine className="size-4" /> Custom entry
        </Chip>
      </Group>
    </div>
  )
}
