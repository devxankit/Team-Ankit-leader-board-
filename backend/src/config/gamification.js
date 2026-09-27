/**
 * Gamification settings — the one file to edit to rebalance the game.
 * The logic that uses these lives in services/gamification.js.
 */

/**
 * Levels are based on a member's ALL-TIME points, whatever period the
 * leaderboard is showing. `min` is inclusive; keep the list in ascending order.
 * The first level catches everything below the second one (negative scores).
 */
export const LEVELS = [
  { key: 'warning', name: 'Warning', min: -Infinity },
  { key: 'rookie', name: 'Rookie', min: 0 },
  { key: 'bronze', name: 'Bronze', min: 100 },
  { key: 'silver', name: 'Silver', min: 250 },
  { key: 'gold', name: 'Gold', min: 500 },
  { key: 'diamond', name: 'Diamond', min: 1000 },
  { key: 'legend', name: 'Legend', min: 2000 },
]

/** 🔥 On fire: at least `minRewards` rewards and at most `maxPenalties` penalties in the last `windowDays`. */
export const ON_FIRE = {
  windowDays: 7,
  minRewards: 3,
  maxPenalties: 0,
}

/** Rank movement (▲2 / ▼1 / –) compares today's standings with the standings `lookbackDays` ago. */
export const TREND = {
  lookbackDays: 7,
}

/** Latest-activity feed size. */
export const FEED = {
  defaultLimit: 40,
  maxLimit: 100,
}
