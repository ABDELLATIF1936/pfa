import { useEffect, useState } from 'react'

import { getBornes } from '@/api/endpoints/bornes'
import { getSites } from '@/api/endpoints/sites'
import type { Borne } from '@/features/bornes/types/borne.types'
import type { Site } from '@/features/sites/types/site.types'

export interface SiteWithBornesCount extends Site {
  bornes: Borne[]
  totalBornes: number
  availableBornes: number
}

export function useSitesWithBornesCount() {
  const [sites, setSites] = useState<SiteWithBornesCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getSites(), getBornes()])
      .then(([loadedSites, loadedBornes]) => {
        if (cancelled) return
        setSites(loadedSites.map((site) => {
          const siteBornes = loadedBornes.filter((borne) => borne.siteId === site.id || borne.site?.id === site.id)
          return {
            ...site,
            bornes: siteBornes,
            totalBornes: siteBornes.length,
            availableBornes: siteBornes.filter((borne) => borne.statut === 'disponible').length,
          }
        }))
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger les sites et les bornes.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { sites, isLoading, error }
}