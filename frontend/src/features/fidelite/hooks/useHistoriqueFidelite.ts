import { useCallback, useEffect, useState } from 'react'

import { getHistoriqueFidelite } from '@/api/endpoints/fidelite'
import type { HistoriquePointsEntry } from '@/features/fidelite/types/fidelite.types'

export function useHistoriqueFidelite() {
  const [items, setItems] = useState<HistoriquePointsEntry[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(20)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getHistoriqueFidelite({ page })
      setItems(response.items)
      setTotal(response.total)
      setLimit(response.limit)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Impossible de charger votre historique fidélité.')
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    void refetch()
  }, [refetch])

  const totalPages = Math.max(1, Math.ceil(total / limit))
  return { items, page, setPage, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1, isLoading, error, refetch }
}