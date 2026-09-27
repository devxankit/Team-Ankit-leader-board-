import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'motion/react'
import Avatar from '@/components/ui/Avatar'
import { firstName } from '@/lib/format'

const CONFETTI_COLORS = ['#fbbf24', '#8b7dff', '#4ade80', '#f472b6', '#38bdf8']

/** "New leader!" / "Level up!" banner with confetti, triggered by live updates. */
export default function Celebration({ moment, onDone }) {
  useEffect(() => {
    if (!moment) return undefined
    const leader = moment.type === 'leader'
    confetti({
      particleCount: leader ? 180 : 110,
      spread: leader ? 110 : 80,
      startVelocity: 48,
      origin: { y: 0.3 },
      colors: CONFETTI_COLORS,
      zIndex: 60,
      disableForReducedMotion: true,
    })
    const timer = setTimeout(onDone, 5000)
    return () => clearTimeout(timer)
  }, [moment, onDone])

  return (
    <AnimatePresence>
      {moment && (
        <motion.div
          key={moment.id}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed inset-x-0 top-20 z-50 flex justify-center px-4"
        >
          <button
            type="button"
            onClick={onDone}
            className="flex items-center gap-4 rounded-3xl border-2 border-gold/60 bg-surface/95 px-5 py-3.5 text-left shadow-2xl shadow-amber-500/20 backdrop-blur"
          >
            <span className="animate-float text-5xl" aria-hidden="true">
              {moment.type === 'leader' ? '👑' : '⭐'}
            </span>
            <span>
              <span className="block bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text font-display text-3xl font-black uppercase tracking-wide text-transparent">
                {moment.type === 'leader' ? 'New leader!' : 'Level up!'}
              </span>
              <span className="block text-sm">
                <strong>{firstName(moment.row.member.name)}</strong>{' '}
                {moment.type === 'leader' ? 'takes the #1 spot' : `reached ${moment.row.level.name}`}
              </span>
            </span>
            <Avatar name={moment.row.member.name} color={moment.row.member.avatarColor} size="lg" className="ring-4 ring-gold/60" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
