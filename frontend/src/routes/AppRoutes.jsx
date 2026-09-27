import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AdminLayout from '@/layouts/AdminLayout'
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute'
import { AuthProvider } from '@/context/AuthContext'
import PageLoader from '@/components/ui/PageLoader'
import ScrollToTop from './ScrollToTop'

// Public Pages
import Home from '@/pages/Home'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'

// Admin Pages
import AdminLogin from '@/pages/admin/AdminLogin'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminProfile from '@/pages/admin/AdminProfile'

export default function AppRoutes() {
  return (
    <AuthProvider>
      <ScrollToTop />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Website Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Dashboard Routes */}
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
