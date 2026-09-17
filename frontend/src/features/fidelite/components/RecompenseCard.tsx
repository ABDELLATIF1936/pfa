import { Gift, Star } from 'lucide-react'
import { motion } from 'framer-motion'

import type { Recompense } from '@/features/fidelite/types/fidelite.types'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'

interface RecompenseCardProps {
  recompense: Recompense
  points: number
  onEchanger: (recompense: Recompense) => void
}

export function RecompenseCard({ recompense, points, onEchanger }: RecompenseCardProps) {
  const missingPoints = Math.max(0, recompense.coutPoints - points)
  return <motion.div whileHover={recompense.atteignable ? { y: -4 } : undefined} className="h-full"><Card className={`flex h-full flex-col p-5 ${recompense.atteignable ? 'border-emerald-200 shadow-[0_18px_45px_-30px_rgba(16,185,129,.7)]' : 'opacity-70 grayscale-[.15]'}`}>
    <div className="flex items-start justify-between gap-4"><span className={`flex size-11 items-center justify-center rounded-xl ${recompense.atteignable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}><Gift className="size-5" /></span><span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 font-mono text-sm font-bold text-amber-700"><Star className="size-3.5 fill-current" />{recompense.coutPoints.toLocaleString('fr-FR')} pts</span></div>
    <h3 className="mt-5 text-lg font-semibold text-slate-950">{recompense.nom}</h3><p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{recompense.description}</p>
    <Button type="button" disabled={!recompense.atteignable} onClick={() => onEchanger(recompense)} className="mt-6 w-full">{recompense.atteignable ? 'Échanger mes points' : `Il vous manque ${missingPoints.toLocaleString('fr-FR')} points`}</Button>
  </Card></motion.div>
}