import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

import { echangerRecompense } from '@/api/endpoints/fidelite'
import type { CompteFidelite, Recompense } from '@/features/fidelite/types/fidelite.types'

interface UseEchangerRecompenseOptions {
  onCompteUpdated: (updater: (current: CompteFidelite) => CompteFidelite) => void
  onSuccess?: () => void
}

function getBackendMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return 'Impossible d’échanger cette récompense.'
  const message = error.response?.data?.message
  return Array.isArray(message) ? message.join(', ') : message ?? 'Impossible d’échanger cette récompense.'
}

export function useEchangerRecompense({ onCompteUpdated, onSuccess }: UseEchangerRecompenseOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const echanger = async (recompense: Recompense) => {
    if (isLoading) return false
    setIsLoading(true)
    setError(null)
    try {
      const response = await echangerRecompense(recompense.id)
      onCompteUpdated((current) => ({
        ...current,
        points: response.nouveauSolde,
        recompensesDisponibles: current.recompensesDisponibles
          .filter((item) => item.id !== recompense.id)
          .map((item) => ({ ...item, atteignable: item.coutPoints <= response.nouveauSolde })),
      }))
      toast.success(`🎉 Vous avez échangé ${response.recompense.nom} !`)
      onSuccess?.()
      return true
    } catch (requestError) {
      const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined
      const message = status === 400 ? getBackendMessage(requestError) : status === 404 ? 'Cette récompense n’est plus disponible' : getBackendMessage(requestError)
      setError(message)
      if (status === 404) {
        onCompteUpdated((current) => ({
          ...current,
          recompensesDisponibles: current.recompensesDisponibles.filter((item) => item.id !== recompense.id),
        }))
      }
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { echanger, isLoading, error }
}