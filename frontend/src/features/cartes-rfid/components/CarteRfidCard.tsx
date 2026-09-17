import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, LockKeyhole, ShieldAlert } from 'lucide-react'

import { bloquerCarte } from '@/api/endpoints/cartesRfid'
import type { CarteRfid, CarteRfidStatus } from '@/features/cartes-rfid/types/carteRfid.types'
import { Badge, type BadgeVariant } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { Modal } from '@/shared/components/Modal'
import { fadeInUp } from '@/shared/utils/animations'

interface CarteRfidCardProps {
  carte: CarteRfid
  onBlocked: (carte: CarteRfid) => void
}

const statusConfig: Record<CarteRfidStatus, { label: string; variant: BadgeVariant; gradient: string }> = {
  active: { label: 'Active', variant: 'success', gradient: 'from-client-dark-bg via-emerald-950 to-client-dark-surface' },
  bloquee: { label: 'Bloquée', variant: 'danger', gradient: 'from-client-dark-bg via-red-950 to-client-dark-surface' },
  inactive: { label: 'Inactive', variant: 'default', gradient: 'from-slate-500 to-slate-700' },
  desactivee: { label: 'Désactivée', variant: 'default', gradient: 'from-slate-500 to-slate-700' },
  perdue: { label: 'Perdue', variant: 'danger', gradient: 'from-client-dark-bg via-red-950 to-client-dark-surface' },
}

export function CarteRfidCard({ carte, onBlocked }: CarteRfidCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [isBlocking, setIsBlocking] = useState(false)
  const [error, setError] = useState('')
  const config = statusConfig[carte.statut] ?? statusConfig.inactive

  const handleBlock = async () => {
    if (confirmation !== 'BLOQUER') return
    setIsBlocking(true)
    setError('')
    try {
      const blocked = await bloquerCarte(carte.id)
      onBlocked(blocked)
      setConfirmOpen(false)
      setConfirmation('')
    } catch {
      setError('Impossible de bloquer cette carte pour le moment.')
    } finally {
      setIsBlocking(false)
    }
  }

  return (
    <>
      <motion.div variants={fadeInUp} className="h-full">
      <Card className="h-full overflow-hidden">
        <div className={`relative aspect-[1.586/1] overflow-hidden bg-gradient-to-br ${config.gradient} p-5 text-white`}>
          <div className="absolute -right-10 -top-10 size-36 rounded-full border border-white/10" />
          <div className="absolute -bottom-20 -left-10 size-44 rounded-full border border-white/10" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between"><CreditCard className="size-7 text-emerald-300" /><span className="font-mono text-xs tracking-[0.18em] text-white/50">VOLTWAY RFID</span></div>
            <div><p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Identifiant de carte</p><p className="mt-2 font-mono text-lg tracking-[0.12em] sm:text-xl">{carte.identifiantUnique}</p></div>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3"><Badge variant={config.variant}>{config.label}</Badge><span className="text-xs text-slate-500">{new Date(carte.dateActivation).toLocaleDateString('fr-FR')}</span></div>
          {carte.statut === 'active' ? <Button type="button" variant="secondary" className="w-full gap-2 border-red-200 text-red-700 hover:bg-red-50" onClick={() => setConfirmOpen(true)}><LockKeyhole className="size-4" />Bloquer cette carte</Button> : null}
        </div>
      </Card>
      </motion.div>
      <Modal open={confirmOpen} onClose={() => !isBlocking && setConfirmOpen(false)} title="Bloquer définitivement cette carte ?">
        <div className="space-y-5">
          <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"><ShieldAlert className="mt-0.5 size-5 shrink-0" /><p>Cette action est irréversible sans intervention de l’administrateur. Continuez uniquement si la carte est perdue ou volée.</p></div>
          <label className="block text-sm font-medium text-slate-700" htmlFor={`confirm-block-${carte.id}`}>Écrivez <strong>BLOQUER</strong> pour confirmer<input id={`confirm-block-${carte.id}`} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 font-mono uppercase outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" autoComplete="off" /></label>
          {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-3"><Button type="button" variant="secondary" disabled={isBlocking} onClick={() => setConfirmOpen(false)}>Annuler</Button><Button type="button" disabled={confirmation !== 'BLOQUER'} isLoading={isBlocking} className="bg-red-600 hover:bg-red-700" onClick={() => void handleBlock()}>Bloquer la carte</Button></div>
        </div>
      </Modal>
    </>
  )
}