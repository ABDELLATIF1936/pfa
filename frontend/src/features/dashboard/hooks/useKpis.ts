import { useEffect, useState } from 'react'

import { getBornesStatus, getRevenueStats, getSessionsStats } from '@/api/endpoints/dashboard'

export function useKpis() {
  const [sessionsDuJour, setSessionsDuJour] = useState(0)
  const [revenuDuMois, setRevenuDuMois] = useState(0)
  const [tauxOccupation, setTauxOccupation] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    void Promise.all([
      getSessionsStats({ dateDebut: startOfDay.toISOString(), dateFin: now.toISOString() }),
      getRevenueStats({ dateDebut: startOfMonth.toISOString(), dateFin: now.toISOString() }),
      getBornesStatus(),
    ]).then(([sessions, revenue, status]) => {
      setSessionsDuJour(sessions.nombreSessions)
      setRevenuDuMois(revenue.revenue)
      setTauxOccupation(status.total === 0 ? 0 : Math.round((status.en_charge / status.total) * 100))
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Impossible de charger les indicateurs.'))
      .finally(() => setIsLoading(false))
  }, [])

  return { sessionsDuJour, revenuDuMois, tauxOccupation, isLoading, error }
}