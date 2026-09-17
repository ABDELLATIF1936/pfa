import { useEffect, useState } from 'react'
import { BatteryCharging, MapPin, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

import api from '@/api/client'
import type { SessionDetail, SessionStatus } from '@/features/sessions/types/session.types'

interface SessionProgressCardProps {
  session: SessionDetail
  status: SessionStatus
}

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remaining = safeSeconds % 60
  return hours > 0 ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}` : `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
}

export function SessionProgressCard({ session, status }: SessionProgressCardProps) {
  const [tariff, setTariff] = useState<{ prixParKwh?: number; prixParMinute?: number }>({})

  useEffect(() => {
    void api.get<{ prixParKwh?: number; prixParMinute?: number }>('/grilles-tarifaires/actuelle')
      .then(({ data }) => setTariff(data))
      .catch(() => setTariff({}))
  }, [])

  const estimatedCost = Math.round((Number(status.energieConsommee || 0) * Number(tariff.prixParKwh || 0) + Math.ceil(status.tempsEcoule / 60) * Number(tariff.prixParMinute || 0)) * 100) / 100
  const siteLabel = session.borne.site?.nom ?? session.borne.site?.ville

  return (
    <section className="overflow-hidden rounded-3xl border border-client-dark-muted bg-gradient-to-br from-client-dark-bg via-client-dark-surface to-emerald-950 p-6 text-white shadow-2xl sm:p-10">
      <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-emerald-300">Recharge en cours</p><h1 className="mt-3 text-2xl font-semibold">Votre véhicule se recharge</h1></div><motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.8, repeat: Infinity }} className="flex size-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950"><BatteryCharging className="size-6" /></motion.div></div>
      <div className="mt-12 text-center"><motion.p key={status.energieConsommee} initial={{ opacity: .45, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-6xl font-semibold tracking-tight text-emerald-300 sm:text-7xl">{Number(status.energieConsommee || 0).toFixed(3)} <span className="text-2xl text-white/50">kWh</span></motion.p><p className="mt-3 text-sm text-white/55">Énergie consommée</p></div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/[.07] p-5"><p className="text-sm text-white/55">Durée écoulée</p><p className="mt-2 font-mono text-3xl font-semibold">{formatDuration(status.tempsEcoule)}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.07] p-5"><p className="text-sm text-white/55">Coût estimé</p><p className="mt-2 font-mono text-3xl font-semibold text-emerald-300">{estimatedCost.toFixed(2)} MAD</p><p className="mt-2 text-xs leading-5 text-white/40">Estimation, le montant final peut différer légèrement.</p></div></div>
      <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-5 text-sm text-white/65"><MapPin className="size-4 text-emerald-300" /><span>{session.borne.identifiantUnique}{siteLabel ? ` · ${siteLabel}` : ''}</span><Zap className="ml-auto size-4 animate-pulse text-emerald-300" /></div>
    </section>
  )
}
