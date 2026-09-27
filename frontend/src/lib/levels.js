import { Gem, Medal, Sparkles, Sprout, TriangleAlert } from 'lucide-react'

/**
 * Visual style per level key. Thresholds and names come from the server
 * (backend/src/config/gamification.js), so only looks live here.
 */
export const LEVEL_STYLES = {
  warning: { icon: TriangleAlert, chip: 'bg-penalty-soft text-penalty ring-penalty/25', bar: 'bg-penalty' },
  rookie: { icon: Sprout, chip: 'bg-subtle text-muted ring-line', bar: 'bg-muted' },
  bronze: { icon: Medal, chip: 'bg-bronze/12 text-bronze ring-bronze/30', bar: 'bg-bronze' },
  silver: { icon: Medal, chip: 'bg-silver/18 text-ink ring-silver/45', bar: 'bg-silver' },
  gold: { icon: Medal, chip: 'bg-gold/14 text-gold ring-gold/35', bar: 'bg-gold' },
  diamond: {
    icon: Gem,
    chip: 'bg-sky-500/12 text-sky-700 ring-sky-500/30 dark:text-sky-300',
    bar: 'bg-sky-500 dark:bg-sky-400',
  },
  legend: {
    icon: Sparkles,
    chip: 'bg-fuchsia-500/12 text-fuchsia-700 ring-fuchsia-500/30 dark:text-fuchsia-300',
    bar: 'bg-gradient-to-r from-fuchsia-500 to-violet-500',
  },
}

export const levelStyle = (key) => LEVEL_STYLES[key] ?? LEVEL_STYLES.rookie
