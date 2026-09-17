import { useEffect, useState } from 'react'

import { getFactures, type FacturesFilters } from '@/api/endpoints/factures'
import type { Facture } from '@/features/factures/types/facture.types'

const PAGE_SIZE = 12

export function useFactures() {
  const [factures, setFactures] = useState<Facture[]>([])
  const [filters, setFilters] = useState<Omit<FacturesFilters, 'page' | 'limit'>>({})
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const timeout = window.setTimeout(() => {
      setIsLoading(true)
      setError(null)
      void getFactures({ ...filters, page, limit: PAGE_SIZE })
        .then(({ items, total: loadedTotal }) => {
          if (cancelled) return
          setFactures(items)
          setTotal(loadedTotal)
        })
        .catch(() => {
          if (!cancelled) setError('Impossible de charger vos factures.')
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [filters, page])

  const updateFilters = (nextFilters: Omit<FacturesFilters, 'page' | 'limit'>) => {
    setFilters(nextFilters)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return {
    factures,
    filters,
    updateFilters,
    page,
    setPage,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    isLoading,
    error,
  }
}