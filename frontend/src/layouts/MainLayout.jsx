import { Outlet } from 'react-router-dom'
import TopBar from '@/components/layout/TopBar'

/** The public leaderboard shell. */
export default function MainLayout() {
  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
        <Outlet />
      </main>
    </div>
  )
}
