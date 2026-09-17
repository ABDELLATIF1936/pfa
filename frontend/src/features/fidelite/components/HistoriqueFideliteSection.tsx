import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { HistoriqueFideliteRow } from '@/features/fidelite/components/HistoriqueFideliteRow'
import { useHistoriqueFidelite } from '@/features/fidelite/hooks/useHistoriqueFidelite'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { Skeleton } from '@/shared/components/Skeleton'
import { staggerContainer, staggerItem } from '@/shared/utils/animations'

type HistoryFilter = 'tout' | 'gain' | 'echange'

export function HistoriqueFideliteSection({ refreshToken = 0 }: { refreshToken?: number }) {
  const [filter, setFilter] = useState<HistoryFilter>('tout')
  const { items, page, setPage, total, totalPages, hasNextPage, hasPreviousPage, isLoading, error, refetch } = useHistoriqueFidelite()
  const filteredItems = filter === 'tout' ? items : items.filter((item) => item.type === filter)
  const rewards = items.filter((item) => item.type === 'echange')

  useEffect(() => {
    if (refreshToken > 0) void refetch()
  }, [refreshToken, refetch])

  return <section className="mt-12 border-t border-slate-200 pt-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-xl font-semibold text-slate-950">Historique de mes points</h2><p className="mt-1 text-sm text-slate-500">Suivez vos gains et vos échanges de récompenses.</p></div><div className="flex gap-2" role="tablist" aria-label="Filtrer l’historique"><FilterButton active={filter === 'tout'} onClick={() => setFilter('tout')}>Tout</FilterButton><FilterButton active={filter === 'gain'} onClick={() => setFilter('gain')}>Gains</FilterButton><FilterButton active={filter === 'echange'} onClick={() => setFilter('echange')}>Échanges</FilterButton></div></div>
    {error ? <EmptyState title="Historique indisponible" description={error} action={<Button type="button" variant="secondary" onClick={() => void refetch()}>Réessayer</Button>} /> : isLoading ? <div className="mt-5 space-y-3"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : filteredItems.length === 0 ? <div className="mt-5"><EmptyState title="Aucun historique" description="Commencez à recharger pour gagner vos premiers points !" /></div> : <Card className="mt-5 px-5"><motion.div variants={staggerContainer} initial="hidden" animate="visible">{filteredItems.map((item, index) => <motion.div key={`${item.dateOperation}-${item.type}-${index}`} variants={staggerItem}><HistoriqueFideliteRow entry={item} /></motion.div>)}</motion.div></Card>}
    {rewards.length > 0 ? <div className="mt-8"><h3 className="text-lg font-semibold text-slate-950">Mes récompenses obtenues</h3><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rewards.map((reward, index) => <div key={`${reward.dateOperation}-${index}`} className="rounded-xl border border-orange-100 bg-orange-50/50 p-4"><p className="font-medium text-slate-900">{reward.description.replace(/^Échange récompense\s*/i, '')}</p><p className="mt-1 text-xs text-slate-500">Obtenue le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(reward.dateOperation))}</p></div>)}</div></div> : null}
    {total > 0 ? <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm text-slate-500 sm:flex-row"><span>{total} opération{total > 1 ? 's' : ''} · page {page} sur {totalPages}</span><div className="flex gap-2"><Button type="button" variant="secondary" disabled={!hasPreviousPage} onClick={() => setPage((current) => current - 1)}>Précédent</Button><Button type="button" variant="secondary" disabled={!hasNextPage} onClick={() => setPage((current) => current + 1)}>Suivant</Button></div></div> : null}
  </section>
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>{children}</button>
}