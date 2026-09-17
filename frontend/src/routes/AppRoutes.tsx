/*
 * Convention adoptée : chaque feature peut exposer ses propres sous-routes et
 * les monter ici au fur et à mesure des tâches fonctionnelles ultérieures.
 */
import { useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'

import api from '@/api/client'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { ProfilePage } from '@/features/auth/pages/ProfilePage'
import { SitesListPage } from '@/features/sites/pages/SitesListPage'
import { BornesListPage } from '@/features/bornes/pages/BornesListPage'
import { BorneDetailPage } from '@/features/bornes/pages/BorneDetailPage'
import { AdminDashboardPage } from '@/features/dashboard/pages/AdminDashboardPage'
import { StatistiquesPage } from '@/features/dashboard/pages/StatistiquesPage'
import { TarificationPage } from '@/features/tarification/pages/TarificationPage'
import { AdminProfilePage } from '@/features/dashboard/pages/AdminProfilePage'
import { useAuthStore } from '@/features/auth/store/authStore'
import { AdminRoute } from '@/routes/AdminRoute'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import navigationService from '@/routes/navigationService'
import { ROUTES } from '@/routes/routes.config'
import { AccessDeniedPage } from '@/shared/components/AccessDeniedPage'
import { HomePage } from '@/features/home/components/HomePage'
import { ScanQrPage } from '@/features/sessions/pages/ScanQrPage'
import { CartesRfidPage } from '@/features/cartes-rfid/pages/CartesRfidPage'
import { SessionTrackingPage } from '@/features/sessions/pages/SessionTrackingPage'
import { SessionsListPage } from '@/features/sessions/pages/SessionsListPage'
import { SitesDiscoveryPage } from '@/features/sites/pages/SitesDiscoveryPage'
import { SiteDetailClientPage } from '@/features/sites/pages/SiteDetailClientPage'
import { ClientLayout } from '@/shared/components/Layout/ClientLayout'
import { FacturesListPage } from '@/features/factures/pages/FacturesListPage'
import { WalletPage } from '@/features/wallet/pages/WalletPage'
import { FidelitePage } from '@/features/fidelite/pages/FidelitePage'

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <h1 className="text-2xl font-bold text-blue-600">{title}</h1>
  </div>
)

function NavigationBridge() {
  const navigate = useNavigate()

  useEffect(() => {
    navigationService.setNavigate(navigate)
  }, [navigate])

  return null
}

function AuthRedirectRoute({ children }: { children: ReactNode }) {
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAdmin = useAuthStore((state) => state.isAdmin)

  if (!hasHydrated) return null
  if (!isAuthenticated) return <>{children}</>

  const destination = isAdmin
    ? ROUTES.DASHBOARD_ADMIN
    : ROUTES.DASHBOARD_CLIENT

  return <Navigate to={destination} replace />
}

function SessionBootstrap() {
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const setSessionChecking = useAuthStore((state) => state.setSessionChecking)

  useEffect(() => {
    if (!hasHydrated || !token) return

    setSessionChecking(true)
    // Vérifie au démarrage qu'un JWT persistant n'a pas expiré pendant l'arrêt de l'app.
    void api.get('/users/me')
      .catch((error: unknown) => {
        if (error && typeof error === 'object' && 'response' in error &&
          error.response && typeof error.response === 'object' &&
          'status' in error.response && error.response.status === 401) {
          logout()
        }
      })
      .finally(() => setSessionChecking(false))
  }, [hasHydrated, logout, setSessionChecking, token])

  return null
}

export function AppRoutes() {
  return (
    <>
      <NavigationBridge />
      <SessionBootstrap />
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route
          path={ROUTES.LOGIN}
          element={
            <AuthRedirectRoute>
              <AuthShell key="login" initialMode="login" />
            </AuthRedirectRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <AuthRedirectRoute>
              <AuthShell key="register" initialMode="register" />
            </AuthRedirectRoute>
          }
        />
        <Route path={ROUTES.ACCESS_DENIED} element={<AccessDeniedPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<ClientLayout />}>
            <Route path={ROUTES.SCAN_QR} element={<ScanQrPage />} />
            <Route path={ROUTES.DASHBOARD_CLIENT} element={<SitesDiscoveryPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.VEHICULES} element={<PlaceholderPage title="Véhicules" />} />
            <Route path={ROUTES.CARTES_RFID} element={<CartesRfidPage />} />
            <Route path={ROUTES.SITES_MAP} element={<SitesDiscoveryPage />} />
            <Route path={ROUTES.SITE_DETAIL} element={<SiteDetailClientPage />} />
            <Route path={ROUTES.SESSIONS} element={<SessionsListPage />} />
            <Route path={ROUTES.SESSION_DETAIL} element={<SessionTrackingPage />} />
            <Route path={ROUTES.FACTURES} element={<FacturesListPage />} />
            <Route path={ROUTES.FACTURE_DETAIL} element={<PlaceholderPage title="Détail de facture" />} />
            <Route path={ROUTES.WALLET} element={<WalletPage />} />
            <Route path={ROUTES.FIDELITE} element={<FidelitePage />} />
          </Route>
        </Route>
        <Route element={<AdminRoute />}>
          <Route path={ROUTES.ADMIN_SITES} element={<SitesListPage />} />
          <Route path={ROUTES.ADMIN_BORNES} element={<BornesListPage />} />
          <Route path={ROUTES.ADMIN_BORNE_DETAIL} element={<BorneDetailPage />} />
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN_STATS} element={<StatistiquesPage />} />
          <Route path={ROUTES.ADMIN_PROFILE} element={<AdminProfilePage />} />
          <Route path={ROUTES.ADMIN_GRILLES_TARIFAIRES} element={<TarificationPage />} />
          <Route path={ROUTES.GRILLES_TARIFAIRES} element={<PlaceholderPage title="Grilles tarifaires" />} />
          <Route path={ROUTES.FIDELITE_NIVEAUX} element={<PlaceholderPage title="Niveaux de fidélité" />} />
          <Route path={ROUTES.FIDELITE_RECOMPENSES} element={<PlaceholderPage title="Récompenses de fidélité" />} />
        </Route>
      </Routes>
    </>
  )
}
