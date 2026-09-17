import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { disconnectSocket } from '@/api/socket'
import type { Personne } from '@/features/auth/types/Personne'

interface AuthState {
  user: Personne | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  hasHydrated: boolean
  isCheckingSession: boolean
  login: (user: Personne, token: string) => void
  setUser: (user: Personne) => void
  logout: () => void
  setSessionChecking: (isChecking: boolean) => void
}

function tokenHasAdminRole(token: string | null): boolean {
  if (!token) return false

  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { role?: string }
    return payload.role === 'administrateur'
  } catch {
    return false
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      hasHydrated: false,
      isCheckingSession: false,
      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        isAdmin: user.type === 'administrateur' || tokenHasAdminRole(token),
      }),
      setUser: (user) => set((state) => ({ user, isAdmin: user.type === 'administrateur' || tokenHasAdminRole(state.token) })),
      logout: () => {
        disconnectSocket()
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false })
      },
      setSessionChecking: (isCheckingSession) => set({ isCheckingSession }),
    }),
    {
      name: 'auth-storage',
      // Le backend renvoie actuellement le JWT dans le JSON de connexion, sans cookie httpOnly.
      // localStorage via persist est donc le compromis retenu pour ce PFA, mais un script injecte
      // peut lire le token (risque XSS). TODO: migrer vers un cookie httpOnly avec un changement backend.
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = Boolean(state.token)
          state.isAdmin = state.user?.type === 'administrateur' || tokenHasAdminRole(state.token)
          state.hasHydrated = true
        }
      },
    },
  ),
)
