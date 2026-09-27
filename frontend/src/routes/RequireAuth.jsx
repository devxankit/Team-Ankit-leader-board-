import { Navigate, Outlet, useLocation } from 'react-router-dom'
import PageLoader from '@/components/ui/PageLoader'
import { useAuth } from '@/hooks/useAuth'

/** Signed-in users only; anyone on a temporary password is sent to set their own first. */
export default function RequireAuth() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }
  return <Outlet />
}
