import { Edit3, MapPin, Trash2 } from 'lucide-react'

import type { Site } from '@/features/sites/types/site.types'
import { SiteMap } from '@/features/sites/components/SiteMap'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'

interface SiteCardProps {
  site: Site
  onEdit: (site: Site) => void
  onDelete: (site: Site) => void
}

export function SiteCard({ site, onEdit, onDelete }: SiteCardProps) {
  return (
    <Card className="overflow-hidden">
      <SiteMap latitude={site.latitude} longitude={site.longitude} nom={site.nom} className="h-44 rounded-none" />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-lg font-semibold text-slate-900">{site.nom}</h2><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="size-4" aria-hidden="true" />{site.adresse}</p></div>
          <Badge>{site.ville}</Badge>
        </div>
        <div className="flex gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" className="flex-1 gap-2" onClick={() => onEdit(site)}><Edit3 className="size-4" aria-hidden="true" /> Modifier</Button>
          <Button type="button" variant="secondary" className="gap-2 text-red-600 hover:bg-red-50" onClick={() => onDelete(site)} aria-label={`Supprimer ${site.nom}`}><Trash2 className="size-4" aria-hidden="true" /> Supprimer</Button>
        </div>
      </div>
    </Card>
  )
}
