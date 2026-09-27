import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PageLoader from '@/components/ui/PageLoader'
import AdminLayout from '@/layouts/AdminLayout'
import MainLayout from '@/layouts/MainLayout'
import ChangePassword from '@/pages/ChangePassword'
import Leaderboard from '@/pages/Leaderboard'
import Login from '@/pages/Login'
import MyProfile from '@/pages/MyProfile'
import NotFound from '@/pages/NotFound'
import RequireAdmin from './RequireAdmin'
import RequireAuth from './RequireAuth'
import ScrollToTop from './ScrollToTop'

// Members never download the admin screens.
const GivePoints = lazy(() => import('@/pages/admin/GivePoints'))
const Rules = lazy(() => import('@/pages/admin/Rules'))
const Members = lazy(() => import('@/pages/admin/Members'))
const ActivityLog = lazy(() => import('@/pages/admin/ActivityLog'))

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route path="/change-password" element={<ChangePassword />} />

            <Route element={<MainLayout />}>
              <Route index element={<Leaderboard />} />
              <Route path="me" element={<MyProfile />} />

              <Route path="admin" element={<RequireAdmin />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Navigate to="points" replace />} />
                  <Route path="points" element={<GivePoints />} />
                  <Route path="rules" element={<Rules />} />
                  <Route path="members" element={<Members />} />
                  <Route path="activity" element={<ActivityLog />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
