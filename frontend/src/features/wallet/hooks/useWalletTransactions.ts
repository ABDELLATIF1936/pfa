import { useEffect, useState, type SetStateAction } from 'react'
import { getTransactionsWallet } from '@/api/endpoints/wallet'
import type { TransactionWallet } from '@/features/wallet/types/wallet.types'

const PAGE_SIZE = 10

export function useWalletTransactions() {
  const [transactions, setTransactions] = useState<TransactionWallet[]>([])
  const [page, setPageState] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void getTransactionsWallet({ page, limit: PAGE_SIZE }).then((response) => {
      if (cancelled) return
      setTransactions(response.items)
      setTotal(response.total)
      setTotalPages(Math.max(1, response.totalPages))
    }).catch(() => { if (!cancelled) setError('Impossible de charger votre historique wallet.') }).finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [page])

  const setPage = (nextPage: SetStateAction<number>) => {
    setIsLoading(true)
    setError(null)
    setPageState(nextPage)
  }

  return { transactions, page, setPage, total, totalPages, isLoading, error, hasNextPage: page < totalPages, hasPreviousPage: page > 1 }
}