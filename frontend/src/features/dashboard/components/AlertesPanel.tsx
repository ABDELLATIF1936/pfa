import { AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

import type { Borne } from '@/features/bornes/types/borne.types'
import { EmptyState } from '@/shared/components/EmptyState'
import { Card } from '@/shared/components/Card'

function ageLabel(updatedAt?: string) {
  if (!updatedAt) return 'Date indisponible'
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(updatedAt).getTime()) / 60000))
  return minutes < 1 ? "à l'instant" : `depuis ${minutes} min`
}

export function AlertesPanel({ bornes }: { bornes: Borne[] }) {
  const alerts = bornes.filter((borne) => borne.statut === 'en_panne' || borne.statut === 'hors_service')
  if (alerts.length === 0) return <EmptyState title="Aucune alerte, tout fonctionne normalement" />
  return <Card className="border-red-200 bg-red-50/40 p-5"><div className="mb-4 flex items-center gap-2"><motion.span animate={{ opacity: [1, 0.45, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}><AlertTriangle className="size-5 text-red-600" aria-hidden="true" /></motion.span><h2 className="font-semibold text-red-900">Alertes à traiter</h2></div><ul className="space-y-3">{alerts.map((borne) => <li key={borne.id} className="flex items-center justify-between gap-4 rounded-lg border border-red-100 bg-white px-3 py-2 text-sm"><div><p className="font-mono font-semibold text-slate-800">{borne.identifiantUnique}</p><p className="text-xs text-slate-500">{borne.site.nom}</p></div><span className="text-xs font-medium text-red-700">{borne.statut.replace('_', ' ')} · {ageLabel(borne.updatedAt)}</span></li>)}</ul></Card>
}
