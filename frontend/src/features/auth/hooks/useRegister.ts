import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'

import { register as registerRequest } from '@/api/endpoints/auth'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { RegisterPayload } from '@/features/auth/types/auth.types'
import { ROUTES } from '@/routes/routes.config'

export function useRegister() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const register = async (payload: RegisterPayload) => {
    setLoading(true)
    setError(null)

    try {
      const response = await registerRequest(payload)
      useAuthStore.getState().login(response.user, response.access_token)
      toast.success('Inscription réussie')
      const from = location.state?.from as { pathname?: string; search?: string; hash?: string } | undefined
      const redirectPath = from?.pathname
        ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
        : ROUTES.DASHBOARD_CLIENT
      navigate(redirectPath, { replace: true })
      return response
    } catch (err: unknown) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      const responseMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined
      const message = Array.isArray(responseMessage)
        ? responseMessage.join(', ')
        : typeof responseMessage === 'string'
          ? responseMessage
          : axios.isAxiosError(err) && !err.response
            ? 'Le serveur est indisponible. Vérifiez que le backend fonctionne sur le port 3000.'
            : 'Une erreur est survenue lors de l’inscription.'

      if (status === 409) {
        setError('Cette adresse email est déjà utilisée.')
        toast.error('Cette adresse email est déjà utilisée.')
      } else {
        setError(message)
        toast.error(message)
      }

      throw err
    } finally {
      setLoading(false)
    }
  }

  return { register, loading, error }
}
