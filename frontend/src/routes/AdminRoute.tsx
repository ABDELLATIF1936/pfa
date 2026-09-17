import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROUTES } from '@/routes/routes.config'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

function AdminGuardOnly() {
  const { isAdmin } = useAuth()

  const location = useLocation()

  return isAdmin
    ? <Outlet />
    : <Navigate to={ROUTES.ACCESS_DENIED} replace state={{ from: location }} />
}

export function AdminRoute() {
  return (
    <ProtectedRoute>
      <AdminGuardOnly />
    </ProtectedRoute>
  )
}