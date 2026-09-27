/**
 * What each part of the leaderboard leads to. Shown to everyone from the
 * "What's at stake" button on the leaderboard. Edit the wording here.
 */
export const OUTCOMES = [
  {
    key: 'top',
    zone: 'Top 3',
    title: 'Promotion track',
    emoji: '🏆',
    tone: 'gold',
    points: ['High chance of promotion', 'Rewards for your performance', 'Considered for further high growth'],
  },
  {
    key: 'middle',
    zone: 'Middle',
    title: 'Keep pushing',
    emoji: '💪',
    tone: 'accent',
    points: ['Keep up the hard work', 'Score more points to climb into the top 3'],
  },
  {
    key: 'bottom',
    zone: 'Bottom 3',
    title: 'Super Team',
    emoji: '🚀',
    tone: 'penalty',
    points: ['Join the Super Team at the Palasia office'],
  },
]
