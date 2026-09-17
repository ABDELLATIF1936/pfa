import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { startSessionQr } from '@/api/endpoints/sessions'
import { ROUTES } from '@/routes/routes.config'
import type { StartQrError, StartSessionResponse } from '@/features/sessions/types/session.types'

const messages: Record<string, string> = {
  404: "QR code non reconnu, cette borne n'existe pas.",
  409: 'Cette borne est déjà en cours d’utilisation ou indisponible.',
  503: 'Cette borne est actuellement hors ligne, réessayez dans quelques instants ou choisissez une autre borne.',
  NETWORK: 'Le serveur est momentanément inaccessible. Vérifiez votre connexion puis réessayez.',
  UNKNOWN: 'Impossible de démarrer la charge. Vérifiez la borne puis réessayez.',
}

export function useStartSessionQr() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<StartQrError | null>(null)
  const [response, setResponse] = useState<StartSessionResponse | null>(null)

  const start = async (identifiantBorne: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await startSessionQr(identifiantBorne)
      setResponse(result)
      toast.success('Commande envoyée à la borne.')
      if (result.sessionId) navigate(`${ROUTES.SESSIONS}/${result.sessionId}`)
      return result
    } catch (caught: unknown) {
      const startError = caught as StartQrError
      const normalizedError: StartQrError = {
        code: startError.code ?? 'UNKNOWN',
        message: messages[String(startError.code)] ?? messages.UNKNOWN,
      }
      setError(normalizedError)
      toast.error(normalizedError.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { start, isLoading, error, response }
}
