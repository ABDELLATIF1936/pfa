import { useEffect, useState } from 'react'
import { WalletCards } from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuthStore } from '@/features/auth/store/authStore'
import { Card } from '@/shared/components/Card'

export function SoldeCard() {
  const balance = Number(useAuthStore((state) => state.user?.soldeWallet ?? 0))
  const [displayedBalance, setDisplayedBalance] = useState(balance)

  useEffect(() => {
    const start = displayedBalance
    const difference = balance - start
    if (Math.abs(difference) < 0.01) return
    const startedAt = performance.now()
    let frame = 0
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / 500, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplayedBalance(start + difference * eased)
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [balance])

  return <Card className="overflow-hidden border-emerald-900/20 bg-gradient-to-br from-client-dark-bg via-client-dark-surface to-emerald-950 p-6 text-white shadow-xl sm:p-8">
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Wallet prépayé</p><h2 className="mt-3 text-lg font-semibold">Votre solde disponible</h2></div><motion.span initial={{ scale: 0.8, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} className="flex size-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950"><WalletCards className="size-6" /></motion.span></div>
    <motion.p key={balance} initial={{ opacity: 0.4, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-10 font-mono text-4xl font-bold tracking-tight sm:text-5xl">{displayedBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xl font-semibold text-emerald-300">MAD</span></motion.p>
    <p className="mt-3 text-sm text-white/60">Utilisable automatiquement pour vos sessions en mode wallet.</p>
  </Card>
}