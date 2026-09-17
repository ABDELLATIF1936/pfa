import { BatteryCharging, Circle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import type { Borne } from '@/features/bornes/types/borne.types'
import { getStatutVariant } from '@/features/bornes/utils/statut.utils'
import { ROUTES } from '@/routes/routes.config'

const backgrounds = { default: 'border-slate-200 bg-white text-slate-700', success: 'border-emerald-200 bg-emerald-50 text-emerald-800', info: 'border-blue-200 bg-blue-50 text-blue-800', danger: 'border-red-200 bg-red-50 text-red-800', warning: 'border-orange-200 bg-orange-50 text-orange-800' }

export function BorneGridCell({ borne }: { borne: Borne }) {
  const navigate = useNavigate()
  const variant = getStatutVariant(borne.statut)
  const isCharging = borne.statut === 'en_charge'
  return <motion.button type="button" layout whileHover={{ y: -3 }} transition={{ layout: { duration: 0.35 } }} onClick={() => navigate(ROUTES.ADMIN_BORNE_DETAIL.replace(':id', borne.id))} className={`relative min-h-32 rounded-xl border p-4 text-left shadow-sm transition-shadow hover:shadow-md ${backgrounds[variant]}`}><div className="flex items-start justify-between gap-2"><span className="font-mono text-xs font-bold tracking-tight">{borne.identifiantUnique}</span>{isCharging ? <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}><BatteryCharging className="size-5" aria-label="En charge" /></motion.span> : <Circle className="size-4 opacity-50" aria-hidden="true" />}</div><p className="mt-4 text-sm font-semibold">{borne.site.nom}</p><p className="mt-1 text-xs capitalize opacity-75">{borne.statut.replace('_', ' ')}</p></motion.button>
}
