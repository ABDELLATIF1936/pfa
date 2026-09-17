import { useEffect, useState } from 'react'
import { Sparkles, Star } from 'lucide-react'
import { motion } from 'framer-motion'

import { Card } from '@/shared/components/Card'

import type { CompteFidelite, NiveauFidelite } from '@/features/fidelite/types/fidelite.types'
import { NiveauBadge } from './NiveauBadge'
import { ProgressionBar } from './ProgressionBar'

export function PointsSummaryCard({ compte, niveaux }: { compte: CompteFidelite; niveaux: NiveauFidelite[] }) {
  const [displayedPoints, setDisplayedPoints] = useState(compte.points)

  useEffect(() => {
    const start = displayedPoints
    const difference = compte.points - start
    if (difference === 0) return
    const startedAt = performance.now()
    let frame = 0
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / 600, 1)
      setDisplayedPoints(Math.round(start + difference * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [compte.points])

  return <Card className="overflow-hidden border-emerald-900/20 bg-gradient-to-br from-client-dark-bg via-client-dark-surface to-emerald-950 p-6 text-white shadow-xl sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Votre parcours fidélité</p><h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Accumulez, rechargez, progressez.</h1></div><motion.span initial={{ scale: 0.8, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} className="flex size-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950"><Sparkles className="size-6" /></motion.span></div>
    <div className="mt-10 flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm text-white/60">Votre solde de points</p><motion.p key={compte.points} initial={{ opacity: 0.4, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-mono text-5xl font-bold tracking-tight sm:text-6xl">{displayedPoints.toLocaleString('fr-FR')} <span className="text-xl font-semibold text-emerald-300">pts</span></motion.p></div><NiveauBadge niveau={compte.niveau} /></div>
    {compte.niveau.pourcentageReduction > 0 ? <p className="mt-5 flex items-center gap-2 text-sm text-emerald-200"><Star className="size-4" />Vous bénéficiez de {compte.niveau.pourcentageReduction}% de réduction sur vos charges.</p> : null}
    <ProgressionBar compte={compte} niveaux={niveaux} />
  </Card>
}