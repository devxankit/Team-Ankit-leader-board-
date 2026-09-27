import { Outlet } from 'react-router-dom'
import TopBar from '@/components/layout/TopBar'

/** The public leaderboard shell. */
export default function MainLayout() {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      {/* Arena glow behind everything */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-56 left-1/2 size-[56rem] -translate-x-1/2 rounded-full bg-accent/12 blur-3xl" />
        <div className="absolute -right-48 top-1/3 size-[34rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-[30rem] rounded-full bg-fuchsia-500/8 blur-3xl" />
      </div>
      <TopBar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <Outlet />
      </main>
    </div>
  )
}
