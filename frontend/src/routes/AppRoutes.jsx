import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import PageLoader from '@/components/ui/PageLoader'
import AdminLayout from '@/layouts/AdminLayout'
import MainLayout from '@/layouts/MainLayout'
import Leaderboard from '@/pages/Leaderboard'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import RequireAdmin from './RequireAdmin'
import ScrollToTop from './ScrollToTop'

// Visitors never download the admin screens.
const Overview = lazy(() => import('@/pages/admin/Overview'))
const GivePoints = lazy(() => import('@/pages/admin/GivePoints'))
const Members = lazy(() => import('@/pages/admin/Members'))
const Rules = lazy(() => import('@/pages/admin/Rules'))
const ActivityLog = lazy(() => import('@/pages/admin/ActivityLog'))
const Account = lazy(() => import('@/pages/admin/Account'))

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public: the leaderboard needs no login. */}
          <Route element={<MainLayout />}>
            <Route index element={<Leaderboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin sign-in and panel. */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Overview />} />
              <Route path="points" element={<GivePoints />} />
              <Route path="members" element={<Members />} />
              <Route path="rules" element={<Rules />} />
              <Route path="activity" element={<ActivityLog />} />
              <Route path="account" element={<Account />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
