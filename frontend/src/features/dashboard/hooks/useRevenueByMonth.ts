import { useEffect, useState } from 'react'

import { getRevenueStats } from '@/api/endpoints/dashboard'
import type { RevenueByMonth } from '@/features/dashboard/types/stats.types'

function monthLabel(date: Date) {
  const label = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' }).format(date)
  return label.replace('.', '').replace(/^./, (character) => character.toUpperCase())
}

export function useRevenueByMonth() {
  const [data, setData] = useState<RevenueByMonth[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const now = new Date()
    const periods = Array.from({ length: 6 }, (_, index) => {
      const start = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - 4 + index, 0, 23, 59, 59, 999)
      return { start, end }
    })
    void Promise.all(periods.map(({ start, end }) => getRevenueStats({ dateDebut: start.toISOString(), dateFin: end.toISOString() })))
      .then((responses) => {
        if (active) setData(responses.map((response, index) => ({ mois: monthLabel(periods[index].start), revenue: response.revenue || 0 })))
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Impossible de charger l’évolution des revenus.')
      })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  return { data, isLoading, error }
}