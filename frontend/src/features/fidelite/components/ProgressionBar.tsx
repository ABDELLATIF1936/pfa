import { motion } from 'framer-motion'

import type { CompteFidelite, NiveauFidelite } from '@/features/fidelite/types/fidelite.types'

interface ProgressionBarProps {
  compte: CompteFidelite
  niveaux: NiveauFidelite[]
}

export function ProgressionBar({ compte, niveaux }: ProgressionBarProps) {
  const sortedLevels = niveaux.slice().sort((a, b) => a.seuilPoints - b.seuilPoints)
  const currentIndex = Math.max(0, sortedLevels.findIndex((niveau) => niveau.id === compte.niveau.id))
  const currentLevel = sortedLevels[currentIndex] ?? compte.niveau
  const nextLevel = sortedLevels[currentIndex + 1]
  const isMaxLevel = compte.pointsProchainNiveau === null || !nextLevel
  const progress = isMaxLevel
    ? 100
    : Math.min(100, Math.max(0, ((compte.points - currentLevel.seuilPoints) / (nextLevel.seuilPoints - currentLevel.seuilPoints)) * 100))
  const firstThreshold = sortedLevels[0]?.seuilPoints ?? 0
  const lastThreshold = sortedLevels[sortedLevels.length - 1]?.seuilPoints ?? firstThreshold
  const thresholdRange = lastThreshold - firstThreshold

  return <div className="mt-7">
    <div className="flex items-center justify-between gap-4 text-sm">
      {isMaxLevel ? <p className="font-semibold text-amber-700">Vous avez atteint le niveau maximum !</p> : <p className="font-medium text-slate-700"><span className="text-slate-950">{compte.points.toLocaleString('fr-FR')}</span> / {nextLevel.seuilPoints.toLocaleString('fr-FR')} points pour atteindre {nextLevel.nom}</p>}
      <span className="font-mono text-xs text-slate-500">{Math.round(progress)}%</span>
    </div>
    <div className={`relative mt-5 ${isMaxLevel ? 'drop-shadow-[0_0_14px_rgba(234,179,8,.42)]' : ''}`}>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.1, ease: 'easeOut' }} className={`h-full rounded-full bg-gradient-to-r ${isMaxLevel ? 'from-emerald-400 via-yellow-400 to-amber-500' : 'from-emerald-500 via-teal-400 to-cyan-400'}`} />
      </div>
      {sortedLevels.map((niveau, index) => {
        const position = thresholdRange === 0 ? 50 : ((niveau.seuilPoints - firstThreshold) / thresholdRange) * 100
        return <div key={niveau.id} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${position}%` }}>
          <span className={`block size-5 rounded-full border-4 border-white shadow-md ${index <= currentIndex || isMaxLevel ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <span className="absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold text-slate-500">{niveau.nom}</span>
        </div>
      })}
    </div>
    <div className="mt-10 flex justify-between text-xs text-slate-400"><span>{currentLevel.seuilPoints.toLocaleString('fr-FR')} pts</span><span>{nextLevel ? `${nextLevel.seuilPoints.toLocaleString('fr-FR')} pts` : 'Palier final'}</span></div>
  </div>
}