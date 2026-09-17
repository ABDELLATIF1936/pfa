import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROUTES } from '@/routes/routes.config'

interface ProtectedRouteProps {
  children?: ReactNode
}

function RouteLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
      <span className="sr-only">Vérification de la session...</span>
    </main>
  )
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { hasHydrated, isCheckingSession, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!hasHydrated || isCheckingSession) return <RouteLoading />

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }

  return children ?? <Outlet />
}
