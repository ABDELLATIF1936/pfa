import { motion } from 'framer-motion'

import { FactureCard } from '@/features/factures/components/FactureCard'
import { FacturesFilters } from '@/features/factures/components/FacturesFilters'
import { useFactures } from '@/features/factures/hooks/useFactures'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { Skeleton } from '@/shared/components/Skeleton'
import { fadeInUp, staggerContainer } from '@/shared/utils/animations'

export function FacturesListPage() {
  const { factures, filters, updateFilters, page, setPage, total, totalPages, hasNextPage, hasPreviousPage, isLoading, error } = useFactures()
  const hasActiveFilters = Boolean(filters.dateDebut || filters.dateFin || filters.siteId)

  return <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-8 text-slate-950 sm:px-8"><div className="mx-auto max-w-7xl space-y-7">
    <motion.header variants={fadeInUp} initial="hidden" animate="visible"><Badge>Suivi financier</Badge><h1 className="mt-3 text-3xl font-bold tracking-tight">Historique des factures</h1><p className="mt-2 text-slate-500">Retrouvez vos dépenses de recharge et téléchargez vos justificatifs.</p></motion.header>
    <FacturesFilters value={filters} onChange={updateFilters} />
    {error ? <EmptyState title="Factures indisponibles" description={error} /> : isLoading ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-80" />)}</div> : factures.length === 0 ? <EmptyState title={hasActiveFilters ? 'Aucune facture correspondante' : 'Aucune facture disponible'} description={hasActiveFilters ? 'Essayez de modifier ou réinitialiser vos filtres.' : 'Vos factures apparaîtront ici après vos sessions de recharge.'} /> : <>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{factures.map((facture) => <FactureCard key={facture.id} facture={facture} />)}</motion.div>
      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm text-slate-500 sm:flex-row"><span>{total} facture{total > 1 ? 's' : ''} · page {page} sur {totalPages}</span><div className="flex gap-2"><Button type="button" variant="secondary" disabled={!hasPreviousPage} onClick={() => setPage((current) => current - 1)}>Précédent</Button><Button type="button" variant="secondary" disabled={!hasNextPage} onClick={() => setPage((current) => current + 1)}>Suivant</Button></div></div>
    </>}
  </div></main>
}