import { Button } from '@/shared/components/Button'
import { Modal } from '@/shared/components/Modal'
import type { Recompense } from '@/features/fidelite/types/fidelite.types'

interface ConfirmEchangeModalProps {
  recompense: Recompense | null
  points: number
  isLoading: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmEchangeModal({ recompense, points, isLoading, onClose, onConfirm }: ConfirmEchangeModalProps) {
  if (!recompense) return null
  const remainingPoints = points - recompense.coutPoints

  return <Modal open={Boolean(recompense)} onClose={isLoading ? () => undefined : onClose} title="Confirmer l’échange"><div className="space-y-5">
    <div><p className="text-sm text-slate-500">Vous êtes sur le point d’échanger vos points contre :</p><p className="mt-2 text-xl font-semibold text-slate-950">{recompense.nom}</p></div>
    <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3"><div><dt className="text-slate-500">Coût</dt><dd className="mt-1 font-mono font-semibold text-slate-900">{recompense.coutPoints.toLocaleString('fr-FR')} pts</dd></div><div><dt className="text-slate-500">Solde actuel</dt><dd className="mt-1 font-mono font-semibold text-slate-900">{points.toLocaleString('fr-FR')} pts</dd></div><div><dt className="text-slate-500">Solde après échange</dt><dd className="mt-1 font-mono font-semibold text-emerald-700">{remainingPoints.toLocaleString('fr-FR')} pts</dd></div></dl>
    <p className="text-sm font-medium text-slate-700">Il vous restera {remainingPoints.toLocaleString('fr-FR')} points après cet échange.</p>
    <div className="flex justify-end gap-3"><Button type="button" variant="secondary" disabled={isLoading} onClick={onClose}>Annuler</Button><Button type="button" isLoading={isLoading} onClick={onConfirm}>Confirmer l’échange</Button></div>
  </div></Modal>
}