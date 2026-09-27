import { Link } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import { getAboutLinks, getGroupMenuColumns } from '@/data/navigation'
import { businessUnits } from '@/data/businessUnits'
import { cn } from '@/lib/cn'

/**
 * Mega-menu panel contents.
 *
 * Both panels are generated from the content data (data/navigation.js), so the
 * header, the mobile drawer and the footer can never list different divisions
 * from one another — which is exactly how the legacy site drifted (PRD A9.7).
 */

function MenuLink({ to, label, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="group/link flex items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-sm font-normal text-ink-700 transition-colors duration-150 hover:bg-ink-50 hover:text-brand-700"
    >
      <span>{label}</span>
      <Icon
        name="chevronRight"
        size={14}
        className="-translate-x-1 opacity-0 text-ink-400 transition-all duration-150 group-hover/link:translate-x-0 group-hover/link:opacity-100 group-hover/link:text-brand-600"
      />
    </Link>
  )
}

function ColumnHeading({ children }) {
  return (
    <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
      {children}
    </p>
  )
}

/** About dropdown — a single narrow column. */
export function AboutPanel({ onNavigate }) {
  const links = getAboutLinks()

  return (
    <div className="w-72 p-3">
      <ColumnHeading>About Vrushahi</ColumnHeading>
      <ul className="flex flex-col">
        <li>
          <MenuLink to="/about" label="Overview" onNavigate={onNavigate} />
        </li>
        {links.map((link) => (
          <li key={link.to}>
            <MenuLink to={link.to} label={link.label} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Group mega-panel — 4 balanced columns + promo card. */
export function GroupPanel({ onNavigate }) {
  const columns = getGroupMenuColumns()

  return (
    <div className="grid w-[min(76rem,calc(100vw-3rem))] gap-8 p-6 lg:grid-cols-12">
      <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-4">
        {columns.map((column) => (
          <div key={column.title} className="min-w-0 flex flex-col gap-4">
            {column.clusters ? (
              column.clusters.map((cluster) => (
                <div key={cluster.title} className="min-w-0">
                  <ColumnHeading>{cluster.title}</ColumnHeading>
                  <ul className="flex flex-col">
                    {cluster.links.map((link) => (
                      <li key={link.to}>
                        <MenuLink to={link.to} label={link.label} onNavigate={onNavigate} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="min-w-0">
                <ColumnHeading>{column.title}</ColumnHeading>
                <ul className="flex flex-col">
                  {column.links.map((link) => (
                    <li key={link.to}>
                      <MenuLink to={link.to} label={link.label} onNavigate={onNavigate} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="lg:col-span-3">
        <div className="flex h-full flex-col justify-between gap-5 rounded-2xl bg-ink-950 p-6 text-white shadow-xl">
          <div>
            <p className="font-display text-3xl font-bold">{businessUnits.length}</p>
            <p className="mt-1 text-sm font-medium text-white/80">divisions, one group</p>
            <p className="mt-3 text-xs leading-relaxed text-white/55">
              From agriculture and export to fintech, media, mining and digital entertainment.
            </p>
          </div>
          <Button
            to="/group"
            variant="light"
            size="sm"
            icon="arrowRight"
            onClick={onNavigate}
            className={cn('w-full')}
          >
            View all divisions
          </Button>
        </div>
      </div>
    </div>
  )
}
