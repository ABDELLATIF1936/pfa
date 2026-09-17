import { AlertTriangle, BatteryCharging, PlugZap, Wrench, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import type { BornesStatusSummary } from '@/features/dashboard/types/dashboard.types'
import type { StatutBorne } from '@/features/bornes/types/borne.types'
import { getStatutVariant } from '@/features/bornes/utils/statut.utils'
import { Card } from '@/shared/components/Card'

const cards: Array<{ key: keyof BornesStatusSummary; label: string; statut?: StatutBorne; icon: typeof Zap }> = [
  { key: 'total', label: 'Total bornes', icon: PlugZap },
  { key: 'disponible', label: 'Disponibles', statut: 'disponible', icon: Zap },
  { key: 'en_charge', label: 'En charge', statut: 'en_charge', icon: BatteryCharging },
  { key: 'en_panne', label: 'En panne', statut: 'en_panne', icon: AlertTriangle },
  { key: 'hors_service', label: 'Hors service', statut: 'hors_service', icon: Wrench },
]

const colors = { default: 'border-slate-200 bg-white text-slate-700', success: 'border-emerald-200 bg-emerald-50 text-emerald-700', info: 'border-blue-200 bg-blue-50 text-blue-700', danger: 'border-red-200 bg-red-50 text-red-700', warning: 'border-orange-200 bg-orange-50 text-orange-700' }

export function StatsSummaryCards({ summary }: { summary: BornesStatusSummary }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map(({ key, label, statut, icon: Icon }) => { const variant = statut ? getStatutVariant(statut) : 'default'; return <Card key={key} className={`border p-5 ${colors[variant]}`}><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium opacity-80">{label}</p><AnimatePresence mode="popLayout"><motion.span key={summary[key]} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mt-2 block text-3xl font-bold">{summary[key]}</motion.span></AnimatePresence></div><Icon className="size-6 opacity-80" aria-hidden="true" /></div></Card> })}</div>
}
