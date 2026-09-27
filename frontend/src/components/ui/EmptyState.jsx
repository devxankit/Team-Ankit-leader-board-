import { cn } from '@/lib/cn'

/** Says what's missing and what to do next. */
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      {Icon && (
        <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-subtle text-muted">
          <Icon className="size-7" aria-hidden="true" />
        </span>
      )}
      <p className="text-base font-semibold">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
