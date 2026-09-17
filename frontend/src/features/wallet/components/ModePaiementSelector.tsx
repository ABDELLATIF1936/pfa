import { useState } from 'react'
import { CreditCard, WalletCards } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { updateMe } from '@/api/endpoints/users'
import { useAuthStore } from '@/features/auth/store/authStore'
import { Card } from '@/shared/components/Card'

type PaymentMode = 'wallet' | 'postpaid'

export function ModePaiementSelector() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [isUpdating, setIsUpdating] = useState(false)
  const selectedMode = user?.modePaiementDefaut ?? 'postpaid'

  const selectMode = async (mode: PaymentMode) => {
    if (!user || mode === selectedMode || isUpdating) return
    setIsUpdating(true)
    try {
      const updatedUser = await updateMe({ modePaiementDefaut: mode })
      setUser(updatedUser)
      toast.success('Mode de paiement par défaut mis à jour.')
    } catch {
      toast.error('Impossible de modifier le mode de paiement.')
    } finally {
      setIsUpdating(false)
    }
  }

  return <Card className="p-6 sm:p-8"><div><h2 className="text-xl font-semibold text-slate-950">Mode de paiement par défaut</h2><p className="mt-1 text-sm text-slate-500">Choisissez comment vos prochaines sessions seront réglées.</p></div><div className="mt-5 grid gap-3 md:grid-cols-2">
    {[{ mode: 'wallet' as const, title: 'Wallet prépayé', description: 'Le montant est débité automatiquement de votre solde', Icon: WalletCards }, { mode: 'postpaid' as const, title: 'Carte bancaire', description: 'Paiement différé après chaque charge', Icon: CreditCard }].map(({ mode, title, description, Icon }) => { const isSelected = selectedMode === mode; return <motion.button key={mode} type="button" disabled={isUpdating} whileHover={{ y: -2 }} animate={{ scale: isSelected ? 1.01 : 1 }} onClick={() => void selectMode(mode)} className={`rounded-2xl border p-5 text-left transition ${isSelected ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100' : 'border-slate-200 bg-white hover:border-emerald-300'} disabled:cursor-wait disabled:opacity-70`}><div className="flex items-start gap-3"><span className={`flex size-10 items-center justify-center rounded-xl ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon className="size-5" /></span><span className="flex-1"><span className="flex items-center justify-between gap-3"><span className="font-semibold text-slate-900">{title}</span><span className={`size-4 rounded-full border-4 ${isSelected ? 'border-emerald-500' : 'border-slate-300'}`} /></span><span className="mt-2 block text-sm leading-5 text-slate-500">{description}</span></span></div></motion.button> })}
  </div>{selectedMode === 'wallet' && Number(user?.soldeWallet ?? 0) < 10 ? <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Votre solde est insuffisant pour démarrer une charge. <Link to="#recharge" className="font-semibold underline underline-offset-2">Pensez à le recharger ci-dessus.</Link></p> : null}</Card>
}