import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard, ShieldCheck, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { motion } from 'framer-motion'

import { rechargerWallet } from '@/api/endpoints/wallet'
import { useAuthStore } from '@/features/auth/store/authStore'
import { rechargeSchema, type RechargeFormValues } from '@/features/wallet/schemas/rechargeSchema'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'

export function RechargeForm() {
  const setUser = useAuthStore((state) => state.setUser)
  const user = useAuthStore((state) => state.user)
  const [paymentFailed, setPaymentFailed] = useState(false)
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<RechargeFormValues>({ resolver: zodResolver(rechargeSchema), defaultValues: { montant: 100 } })

  const onSubmit = async ({ montant }: RechargeFormValues) => {
    if (!Number.isFinite(montant) || montant <= 0) return
    setPaymentFailed(false)
    try {
      const response = await rechargerWallet({ montant })
      if (user) setUser({ ...user, soldeWallet: response.nouveauSolde })
      reset({ montant })
      toast.success(`Recharge réussie. Nouveau solde : ${response.nouveauSolde.toFixed(2)} MAD`)
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 402) {
        setPaymentFailed(true)
        toast.error('Le paiement simulé a échoué. Vérifiez le moyen de paiement puis réessayez.')
      } else {
        toast.error('Impossible de recharger votre wallet pour le moment.')
      }
    }
  }

  return <Card id="recharge" className="p-6 sm:p-8"><div className="flex items-start gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><CreditCard className="size-5" /></span><div><h2 className="text-xl font-semibold text-slate-950">Recharger le wallet</h2><p className="mt-1 text-sm text-slate-500">Ajoutez du crédit en quelques secondes.</p></div></div>
    <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)}><div><label htmlFor="wallet-amount" className="text-sm font-semibold text-slate-700">Montant de la recharge</label><div className="relative mt-2"><input id="wallet-amount" type="number" min="10" step="0.01" {...register('montant', { valueAsNumber: true })} className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-16 text-lg font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" /><span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-slate-400">MAD</span></div>{errors.montant ? <p className="mt-2 text-sm text-red-600">{errors.montant.message}</p> : null}</div>
      <div className="grid grid-cols-4 gap-2">{[50, 100, 200, 500].map((amount) => <button key={amount} type="button" onClick={() => setValue('montant', amount, { shouldValidate: true })} className="rounded-lg border border-slate-200 px-2 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50">{amount} MAD</button>)}</div>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><ShieldCheck className="size-5 text-emerald-600" /><div className="text-sm"><p className="font-semibold text-slate-800">Paiement sécurisé (mode test)</p><p className="text-slate-500">Carte bancaire simulée, aucun débit réel.</p></div></div>
      <Button type="submit" className="w-full gap-2" isLoading={isSubmitting}><motion.span animate={isSubmitting ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 0.8 }}><Sparkles className="size-4" /></motion.span>{paymentFailed ? 'Réessayer la recharge' : 'Recharger mon wallet'}</Button>
    </form>
  </Card>
}