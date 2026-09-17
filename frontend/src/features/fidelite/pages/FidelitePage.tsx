import { useState } from 'react'
import { motion } from 'framer-motion'

import { PointsSummaryCard } from '@/features/fidelite/components/PointsSummaryCard'
import { RecompenseCard } from '@/features/fidelite/components/RecompenseCard'
import { ConfirmEchangeModal } from '@/features/fidelite/components/ConfirmEchangeModal'
import { HistoriqueFideliteSection } from '@/features/fidelite/components/HistoriqueFideliteSection'
import { useFideliteCompte } from '@/features/fidelite/hooks/useFideliteCompte'
import { useEchangerRecompense } from '@/features/fidelite/hooks/useEchangerRecompense'
import type { Recompense } from '@/features/fidelite/types/fidelite.types'
import { EmptyState } from '@/shared/components/EmptyState'
import { Skeleton } from '@/shared/components/Skeleton'
import { staggerContainer, staggerItem } from '@/shared/utils/animations'

export function FidelitePage() {
  const { compte, niveaux, isLoading, error, updateCompte } = useFideliteCompte()
  const [recompenseSelectionnee, setRecompenseSelectionnee] = useState<Recompense | null>(null)
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0)
  const { echanger, isLoading: isExchangeLoading } = useEchangerRecompense({ onCompteUpdated: updateCompte, onSuccess: () => setHistoryRefreshToken((current) => current + 1) })

  if (isLoading) return <main className="mx-auto min-h-[calc(100vh-9rem)] max-w-7xl space-y-6 px-4 py-8 sm:px-8"><Skeleton className="h-80" /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"><Skeleton className="h-64" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div></main>
  if (error || !compte) return <main className="mx-auto min-h-[calc(100vh-9rem)] max-w-7xl px-4 py-12 sm:px-8"><EmptyState title="Fidélité indisponible" description={error ?? 'Impossible de charger votre compte fidélité.'} /></main>

  const recompenses = compte.recompensesDisponibles.slice().sort((a, b) => Number(b.atteignable) - Number(a.atteignable) || a.coutPoints - b.coutPoints)
  return <main className="mx-auto min-h-[calc(100vh-9rem)] max-w-7xl px-4 py-8 sm:px-8"><motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}><p className="font-mono text-xs font-semibold uppercase tracking-[.2em] text-emerald-600">Programme Voltway</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Votre fidélité</h1><p className="mt-2 max-w-2xl text-slate-500">Chaque recharge vous rapproche d’avantages plus généreux.</p></motion.header>
    <div className="mt-8"><PointsSummaryCard compte={compte} niveaux={niveaux} /></div>
    <section className="mt-10"><div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="text-2xl font-semibold text-slate-950">Récompenses disponibles</h2><p className="mt-1 text-sm text-slate-500">Échangez vos points contre des avantages sur vos recharges.</p></div></div>{recompenses.length === 0 ? <EmptyState title="Aucune récompense pour le moment" description="Les récompenses apparaîtront ici dès qu’elles seront configurées." /> : <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{recompenses.map((recompense) => <motion.div key={recompense.id} variants={staggerItem}><RecompenseCard recompense={recompense} points={compte.points} onEchanger={setRecompenseSelectionnee} /></motion.div>)}</motion.div>}</section>
    <HistoriqueFideliteSection refreshToken={historyRefreshToken} />
    <ConfirmEchangeModal recompense={recompenseSelectionnee} points={compte.points} isLoading={isExchangeLoading} onClose={() => setRecompenseSelectionnee(null)} onConfirm={() => { if (recompenseSelectionnee) void echanger(recompenseSelectionnee).then((success) => { if (success) setRecompenseSelectionnee(null) }) }} />
  </main>
}