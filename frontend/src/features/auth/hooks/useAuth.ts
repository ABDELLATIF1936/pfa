import { useAuthStore } from '@/features/auth/store/authStore'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const isCheckingSession = useAuthStore((state) => state.isCheckingSession)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)

  return { user, token, isAuthenticated, isAdmin, hasHydrated, isCheckingSession, login, logout }
}