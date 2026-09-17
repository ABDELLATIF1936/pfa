import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { login as loginRequest } from '@/api/endpoints/auth'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { LoginPayload } from '@/features/auth/types/auth.types'
import { ROUTES } from '@/routes/routes.config'

export function useLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (payload: LoginPayload) => {
    setLoading(true)
    setError(null)

    try {
      const response = await loginRequest(payload)
      useAuthStore.getState().login(response.user, response.access_token)
      toast.success('Connexion réussie')
      const from = location.state?.from as { pathname?: string; search?: string; hash?: string } | undefined
      const redirectPath = from?.pathname
        ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
        : useAuthStore.getState().isAdmin ? ROUTES.DASHBOARD_ADMIN : ROUTES.DASHBOARD_CLIENT
      navigate(redirectPath, { replace: true })
      return response
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
          ? String((err.response.data as { message?: string }).message)
          : 'Identifiants invalides'

      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { login, loading, error }
}
