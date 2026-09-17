import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L, { type LatLngBoundsExpression } from 'leaflet'

import type { SiteWithBornesCount } from '@/features/sites/hooks/useSitesWithBornesCount'
import { ROUTES } from '@/routes/routes.config'

interface SitesMapViewProps {
  sites: SiteWithBornesCount[]
  onlyAvailable: boolean
}

function createSiteIcon(available: boolean) {
  return L.divIcon({
    className: 'site-discovery-marker',
    html: `<div style="align-items:center;background:${available ? '#10b981' : '#64748b'};border:3px solid white;border-radius:999px;box-shadow:0 2px 10px #0f172a66;color:white;display:flex;font-size:16px;height:36px;justify-content:center;width:36px">⚡</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

function FitSitesBounds({ sites }: { sites: SiteWithBornesCount[] }) {
  const map = useMap()

  useEffect(() => {
    if (sites.length === 0) return
    const bounds: LatLngBoundsExpression = sites.map((site) => [site.latitude, site.longitude])
    map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 })
  }, [map, sites])

  return null
}

export function SitesMapView({ sites, onlyAvailable }: SitesMapViewProps) {
  const visibleSites = onlyAvailable ? sites.filter((site) => site.availableBornes > 0) : sites
  const center: [number, number] = visibleSites.length ? [visibleSites[0].latitude, visibleSites[0].longitude] : [33.5731, -7.5898]

  return (
    <div className="relative h-[min(70vh,680px)] min-h-[460px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <MapContainer center={center} zoom={6} scrollWheelZoom className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitSitesBounds sites={visibleSites} />
        {visibleSites.map((site) => <Marker key={site.id} position={[site.latitude, site.longitude]} icon={createSiteIcon(site.availableBornes > 0)}><Popup><div className="min-w-44 space-y-2"><p className="font-semibold text-slate-900">{site.nom}</p><p className="text-sm text-slate-500">{site.ville}</p><p className="text-sm font-medium text-slate-700">{site.availableBornes}/{site.totalBornes} bornes disponibles</p><Link to={`${ROUTES.SITES}/${site.id}`} className="inline-flex rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Voir le détail</Link></div></Popup></Marker>)}
      </MapContainer>
      {visibleSites.length === 0 ? <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/75 p-6 text-center"><div><p className="font-semibold text-slate-900">Aucun site disponible</p><p className="mt-1 text-sm text-slate-500">Désactivez le filtre pour afficher tous les sites.</p></div></div> : null}
      <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur"><p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">Sites affichés</p><p className="mt-1 text-lg font-bold text-slate-900">{visibleSites.length}</p></div>
    </div>
  )
}