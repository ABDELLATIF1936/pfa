import { motion } from 'framer-motion'

import { ModePaiementSelector } from '@/features/wallet/components/ModePaiementSelector'
import { RechargeForm } from '@/features/wallet/components/RechargeForm'
import { SoldeCard } from '@/features/wallet/components/SoldeCard'
import { TransactionRow } from '@/features/wallet/components/TransactionRow'
import { useWalletTransactions } from '@/features/wallet/hooks/useWalletTransactions'
import { EmptyState } from '@/shared/components/EmptyState'
import { Skeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/components/Button'
import { staggerContainer } from '@/shared/utils/animations'

export function WalletPage() {
  const { transactions, page, setPage, total, totalPages, isLoading, error, hasNextPage, hasPreviousPage } = useWalletTransactions()
  return <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-8 text-slate-950 sm:px-8"><div className="mx-auto max-w-7xl space-y-7">
    <header><p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-700">Finances</p><h1 className="mt-3 text-3xl font-bold tracking-tight">Mon wallet</h1><p className="mt-2 text-slate-500">Gérez votre solde prépayé et suivez chaque mouvement.</p></header>
    <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-stretch"><SoldeCard /><RechargeForm /></div>
    <ModePaiementSelector />
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">Historique des transactions</h2><p className="mt-1 text-sm text-slate-500">{total} mouvement{total > 1 ? 's' : ''} wallet</p></div></div>{error ? <div className="mt-5"><EmptyState title="Historique indisponible" description={error} /></div> : isLoading ? <div className="mt-5 space-y-2">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-16" />)}</div> : transactions.length === 0 ? <div className="mt-5"><EmptyState title="Aucune transaction" description="Vos recharges et débits apparaîtront ici." /></div> : <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-3">{transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}</motion.div>}
      {!isLoading && !error && transactions.length > 0 ? <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500"><span>Page {page} sur {totalPages}</span><div className="flex gap-2"><Button type="button" variant="secondary" disabled={!hasPreviousPage} onClick={() => setPage((current) => current - 1)}>Précédent</Button><Button type="button" variant="secondary" disabled={!hasNextPage} onClick={() => setPage((current) => current + 1)}>Suivant</Button></div></div> : null}
    </section>
  </div></main>
}