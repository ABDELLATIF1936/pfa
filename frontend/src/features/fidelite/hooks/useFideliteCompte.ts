import { useCallback, useEffect, useState } from 'react'

import { getMonCompteFidelite, getNiveauxFidelite } from '@/api/endpoints/fidelite'
import type {
  CompteFidelite,
  NiveauFidelite,
} from '@/features/fidelite/types/fidelite.types'

export function useFideliteCompte() {
  const [compte, setCompte] = useState<CompteFidelite | null>(null)
  const [niveaux, setNiveaux] = useState<NiveauFidelite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const updateCompte = useCallback((updater: (current: CompteFidelite) => CompteFidelite) => {
    setCompte((current) => current ? updater(current) : current)
  }, [])

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [compteResponse, niveauxResponse] = await Promise.all([
        getMonCompteFidelite(),
        getNiveauxFidelite(),
      ])
      const niveauxTries = niveauxResponse.slice().sort((a, b) => a.seuilPoints - b.seuilPoints)
      const niveauComplet = niveauxTries.find((niveau) => niveau.nom === compteResponse.niveau.nom) ?? compteResponse.niveau
      setCompte({ ...compteResponse, niveau: niveauComplet })
      setNiveaux(niveauxTries)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Impossible de charger votre compte fidélité.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { compte, niveaux, isLoading, error, refetch, updateCompte }
}