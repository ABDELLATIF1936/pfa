import { ArrowLeft, QrCode } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { getBornes } from '@/api/endpoints/bornes'
import { getSiteById } from '@/api/endpoints/sites'
import { StatutBadge } from '@/features/bornes/components/StatutBadge'
import type { Borne } from '@/features/bornes/types/borne.types'
import { SiteMap } from '@/features/sites/components/SiteMap'
import type { Site } from '@/features/sites/types/site.types'
import { ROUTES } from '@/routes/routes.config'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { Skeleton } from '@/shared/components/Skeleton'

export function SiteDetailClientPage() {
  const { id } = useParams<{ id: string }>()
  const [site, setSite] = useState<Site | null>(null)
  const [bornes, setBornes] = useState<Borne[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    Promise.all([getSiteById(id), getBornes({ siteId: id })])
      .then(([loadedSite, loadedBornes]) => {
        setSite(loadedSite)
        setBornes(loadedBornes)
      })
      .catch(() => {
        setError('Impossible de charger ce site.')
        toast.error('Impossible de charger le détail du site.')
      })
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-5xl space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div></main>
  if (error || !site) return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><div><EmptyState title="Site introuvable" description={error || 'Ce site n’existe pas.'} action={<Link to={ROUTES.SITES_MAP}><Button type="button">Retour à la carte</Button></Link>} /></div></main>

  const hasAvailableBorne = bornes.some((borne) => borne.statut === 'disponible')
  const availableCount = bornes.filter((borne) => borne.statut === 'disponible').length

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-7">
        <Link to={ROUTES.SITES_MAP} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft className="size-4" />Retour aux sites</Link>
        <header><Badge>Site de recharge</Badge><h1 className="mt-3 text-3xl font-bold tracking-tight">{site.nom}</h1><p className="mt-2 text-slate-500">{site.adresse}, {site.ville}</p></header>
        <div className="grid gap-7 lg:grid-cols-[1.1fr_.9fr]">
          <Card className="overflow-hidden border-slate-200 p-2"><SiteMap latitude={Number(site.latitude)} longitude={Number(site.longitude)} nom={site.nom} /></Card>
          <Card className="p-5"><div className="flex items-center justify-between gap-4"><div><h2 className="font-semibold text-slate-900">Bornes sur ce site</h2><p className="mt-1 text-sm text-slate-500">{availableCount}/{bornes.length} disponibles</p></div>{hasAvailableBorne ? <Link to={ROUTES.SCAN_QR}><Button type="button" className="gap-2 bg-emerald-600 hover:bg-emerald-700"><QrCode className="size-4" />Scanner sur place</Button></Link> : null}</div><div className="mt-5 space-y-3">{bornes.length ? bornes.map((borne) => <div key={borne.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3"><div><p className="font-medium text-slate-800">{borne.identifiantUnique}</p><p className="mt-1 text-xs text-slate-500">{borne.typeBorne} · {Number(borne.puissance)} kW</p></div><StatutBadge statut={borne.statut} /></div>) : <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Aucune borne n’est encore installée sur ce site.</p>}</div></Card>
        </div>
      </div>
    </main>
  )
}
