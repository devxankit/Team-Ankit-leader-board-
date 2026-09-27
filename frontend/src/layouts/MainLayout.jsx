import { Outlet } from 'react-router-dom'
import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'

export default function MainLayout() {
  const { isAdmin } = useAuth()

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className={cn('mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pb-16 sm:pt-8', isAdmin ? 'pb-28' : 'pb-12')}>
        <Outlet />
      </main>
      {isAdmin && <BottomNav />}
    </div>
  )
}
