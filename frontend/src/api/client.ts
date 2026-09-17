import axios from 'axios'
import toast from 'react-hot-toast'

import { useAuthStore } from '@/features/auth/store/authStore'
import navigationService from '@/routes/navigationService'
import { ROUTES } from '@/routes/routes.config'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getToken = (): string | null => useAuthStore.getState().token

api.interceptors.request.use(
  (config) => {
    const token = getToken()

    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url
    const isLoginRequest = requestUrl === '/auth/login' || requestUrl?.endsWith('/auth/login')

    if (error.response?.status === 401 && !isLoginRequest) {
      useAuthStore.getState().logout()
      toast.error('Votre session a expiré, veuillez vous reconnecter')
      navigationService.navigate(ROUTES.LOGIN)
    }

    return Promise.reject(error)
  },
)

export default api
