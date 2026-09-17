import { MapPin, Navigation } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import type { SiteWithBornesCount } from '@/features/sites/hooks/useSitesWithBornesCount'
import { ROUTES } from '@/routes/routes.config'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { fadeInUp, staggerContainer } from '@/shared/utils/animations'

interface SitesListViewProps {
  sites: SiteWithBornesCount[]
  onlyAvailable: boolean
  userPosition?: { latitude: number; longitude: number }
}

function distanceKm(from: SitesListViewProps['userPosition'], site: SiteWithBornesCount) {
  if (!from) return null
  const radians = (value: number) => value * Math.PI / 180
  const latitudeDelta = radians(site.latitude - from.latitude)
  const longitudeDelta = radians(site.longitude - from.longitude)
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(from.latitude)) * Math.cos(radians(site.latitude)) * Math.sin(longitudeDelta / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function SitesListView({ sites, onlyAvailable, userPosition }: SitesListViewProps) {
  const visibleSites = (onlyAvailable ? sites.filter((site) => site.availableBornes > 0) : sites)
    .map((site) => ({ site, distance: distanceKm(userPosition, site) }))
    .sort((left, right) => (left.distance ?? Number.POSITIVE_INFINITY) - (right.distance ?? Number.POSITIVE_INFINITY))

  if (visibleSites.length === 0) return <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><p className="font-semibold text-slate-900">Aucun site disponible</p><p className="mt-2 text-sm text-slate-500">Désactivez le filtre pour afficher tous les sites.</p></div>

  return <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2">{visibleSites.map(({ site, distance }) => <motion.div key={site.id} variants={fadeInUp}><Card className="p-5"><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className={`flex size-11 items-center justify-center rounded-xl ${site.availableBornes > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}><MapPin className="size-5" /></span><div><h2 className="font-semibold text-slate-900">{site.nom}</h2><p className="mt-1 text-sm text-slate-500">{site.adresse}, {site.ville}</p></div></div><Badge variant={site.availableBornes > 0 ? 'success' : 'default'}>{site.availableBornes}/{site.totalBornes}</Badge></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm"><span className="text-slate-600">bornes disponibles</span>{distance !== null ? <span className="flex items-center gap-1 text-slate-500"><Navigation className="size-3.5" />{distance < 1 ? '< 1 km' : `${distance.toFixed(1)} km`}</span> : null}</div><Link to={`${ROUTES.SITES}/${site.id}`} className="mt-4 block"><Button type="button" variant="secondary" className="w-full">Voir le détail</Button></Link></Card></motion.div>)}</motion.div>
}