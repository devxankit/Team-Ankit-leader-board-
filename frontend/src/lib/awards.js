import { formatTotal, plural } from './format'

/** Rows arrive in rank order, so on a tie the better-ranked member wins. */
function best(rows, score, eligible) {
  let winner = null
  for (const row of rows) {
    if (eligible(row) && (!winner || score(row) > score(winner))) winner = row
  }
  return winner
}

/**
 * Live awards for the selected period, derived from the leaderboard rows.
 * An award only appears when someone actually qualifies for it.
 */
export function computeAwards(rows) {
  const awards = []

  const leader = rows[0]?.points > 0 ? rows[0] : null
  if (leader) {
    awards.push({ key: 'leader', title: 'Leader', emoji: '👑', tone: 'gold', row: leader, stat: `${formatTotal(leader.points)} pts` })
  }

  const climber = best(rows, (row) => row.trend, (row) => row.trend > 0)
  if (climber) {
    awards.push({ key: 'climber', title: 'Top climber', emoji: '🚀', tone: 'reward', row: climber, stat: `▲ ${plural(climber.trend, 'place')}` })
  }

  const collector = best(rows, (row) => row.rewards, (row) => row.rewards > 0)
  if (collector) {
    awards.push({ key: 'rewards', title: 'Most rewards', emoji: '🎯', tone: 'accent', row: collector, stat: plural(collector.rewards, 'reward') })
  }

  const clean = best(rows, (row) => row.rewards, (row) => row.rewards > 0 && row.penalties === 0)
  if (clean) {
    awards.push({ key: 'clean', title: 'Clean sheet', emoji: '🛡️', tone: 'sky', row: clean, stat: 'Zero penalties' })
  }

  const closest = best(rows, (row) => -row.level.pointsToNext, (row) => Boolean(row.level.next))
  if (closest) {
    awards.push({
      key: 'levelup',
      title: 'Next level-up',
      emoji: '⚡',
      tone: 'bronze',
      row: closest,
      stat: `${formatTotal(closest.level.pointsToNext)} pts to ${closest.level.next.name}`,
    })
  }

  const newcomer = best(rows, (row) => row.points, (row) => row.trend === null)
  if (newcomer) {
    awards.push({ key: 'rising', title: 'Rising star', emoji: '🌱', tone: 'fuchsia', row: newcomer, stat: `New · ${formatTotal(newcomer.points)} pts` })
  }

  return awards
}
