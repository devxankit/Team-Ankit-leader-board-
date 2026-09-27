import { Navigate, Outlet, useLocation } from 'react-router-dom'
import PageLoader from '@/components/ui/PageLoader'
import { useAuth } from '@/hooks/useAuth'

/**
 * Admin screens need the admin to be signed in. The API enforces the same rule
 * on every admin route; this just sends visitors to the sign-in page.
 */
export default function RequireAdmin() {
  const { user, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader />
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}
