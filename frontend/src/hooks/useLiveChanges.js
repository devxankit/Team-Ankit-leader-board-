import { useCallback, useEffect, useRef, useState } from 'react'

const levelFloor = (level) => level.min ?? -Infinity

/** The single member at #1 with points — a tie for first has no leader to celebrate. */
const soleLeader = (rows) => (rows[0] && rows[0].points > 0 && rows[1]?.rank !== 1 ? rows[0] : null)

/**
 * Compares consecutive leaderboard snapshots of the same period and reports
 * what just changed: point deltas per member (for the floating +10 / −5), and
 * the moments worth celebrating — a new leader, or someone levelling up.
 */
export function useLiveChanges(board) {
  const previous = useRef(null)
  const [deltas, setDeltas] = useState({})
  const [moment, setMoment] = useState(null)

  useEffect(() => {
    if (!board) return
    const before = previous.current
    previous.current = board
    // First load or a period switch: nothing "changed", it's just different data.
    if (!before || before.period !== board.period) return

    const oldRows = new Map(before.rows.map((row) => [row.member.id, row]))
    const nextDeltas = {}
    let levelUp = null
    for (const row of board.rows) {
      const old = oldRows.get(row.member.id)
      if (!old) continue
      if (old.points !== row.points) nextDeltas[row.member.id] = { amount: row.points - old.points, id: Date.now() }
      if (!levelUp && levelFloor(row.level) > levelFloor(old.level)) levelUp = row
    }
    if (Object.keys(nextDeltas).length) setDeltas(nextDeltas)

    const leader = soleLeader(board.rows)
    const oldLeader = soleLeader(before.rows)
    if (leader && oldLeader && leader.member.id !== oldLeader.member.id) {
      setMoment({ type: 'leader', row: leader, id: Date.now() })
    } else if (levelUp) {
      setMoment({ type: 'level', row: levelUp, id: Date.now() })
    }
  }, [board])

  // Floating deltas fade out on their own.
  useEffect(() => {
    if (!Object.keys(deltas).length) return undefined
    const timer = setTimeout(() => setDeltas({}), 2600)
    return () => clearTimeout(timer)
  }, [deltas])

  const clearMoment = useCallback(() => setMoment(null), [])
  return { deltas, moment, clearMoment }
}
