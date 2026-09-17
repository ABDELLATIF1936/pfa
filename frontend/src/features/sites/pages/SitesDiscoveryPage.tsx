import { useState } from 'react'
import { List, LocateFixed, Map } from 'lucide-react'

import { SitesListView } from '@/features/sites/components/SitesListView'
import { SitesMapView } from '@/features/sites/components/SitesMapView'
import { useSitesWithBornesCount } from '@/features/sites/hooks/useSitesWithBornesCount'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { Skeleton } from '@/shared/components/Skeleton'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/shared/utils/animations'

type ViewMode = 'map' | 'list'

export function SitesDiscoveryPage() {
  const { sites, isLoading, error } = useSitesWithBornesCount()
  const [viewMode, setViewMode] = useState<ViewMode>(() => window.innerWidth >= 768 ? 'map' : 'list')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number }>()

  const locateUser = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(({ coords }) => setUserPosition({ latitude: coords.latitude, longitude: coords.longitude }))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <motion.header variants={fadeInUp} initial="hidden" animate="visible" className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><Badge>Réseau Voltway</Badge><h1 className="mt-3 text-3xl font-bold tracking-tight">Trouver une borne</h1><p className="mt-2 text-slate-500">Explorez les sites de recharge et vérifiez leur disponibilité en temps réel.</p></div>
          <Button type="button" variant="secondary" className="w-fit gap-2" onClick={locateUser}><LocateFixed className="size-4" />Me localiser</Button>
        </motion.header>
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-28px_rgba(15,23,42,.32)] sm:flex-row sm:items-center">
          <label className="flex cursor-pointer items-center gap-3 px-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={onlyAvailable} onChange={(event) => setOnlyAvailable(event.target.checked)} className="size-4 accent-emerald-600" />Afficher uniquement les sites avec bornes disponibles</label>
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1"><button type="button" onClick={() => setViewMode('map')} className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><Map className="size-4" />Carte</button><button type="button" onClick={() => setViewMode('list')} className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><List className="size-4" />Liste</button></div>
        </div>
        {error ? <EmptyState title="Réseau indisponible" description={error} /> : isLoading ? <Skeleton className="h-[460px]" /> : sites.length === 0 ? <EmptyState title="Aucun site enregistré" description="Les sites de recharge apparaîtront ici dès qu’ils seront disponibles." /> : viewMode === 'map' ? <SitesMapView sites={sites} onlyAvailable={onlyAvailable} /> : <SitesListView sites={sites} onlyAvailable={onlyAvailable} userPosition={userPosition} />}
      </div>
    </main>
  )
}
