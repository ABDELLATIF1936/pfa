import { useState } from 'react'
import toast from 'react-hot-toast'

import { updateStatutBorne } from '@/api/endpoints/bornes'
import type { Borne, StatutBorne } from '@/features/bornes/types/borne.types'
import { getStatutLabel } from '@/features/bornes/utils/statut.utils'
import { Button } from '@/shared/components/Button'
import { Modal } from '@/shared/components/Modal'

const statuses: StatutBorne[] = ['disponible', 'en_charge', 'hors_service', 'en_panne', 'maintenance']

interface StatutChangeMenuProps {
  borne: Borne
  onChanged: (borne: Borne) => void
}

export function StatutChangeMenu({ borne, onChanged }: StatutChangeMenuProps) {
  const [selected, setSelected] = useState<StatutBorne>()
  const [isLoading, setIsLoading] = useState(false)

  const confirm = async () => {
    if (!selected) return
    setIsLoading(true)
    try {
      const updated = await updateStatutBorne(borne.id, selected)
      onChanged(updated)
      setSelected(undefined)
      toast.success('Statut mis à jour.')
    } catch { toast.error('Impossible de modifier le statut.') } finally { setIsLoading(false) }
  }

  return <><select aria-label={`Modifier le statut de ${borne.identifiantUnique}`} value="" onChange={(event) => setSelected(event.target.value as StatutBorne)} className="max-w-40 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"><option value="">Changer le statut</option>{statuses.filter((status) => status !== borne.statut).map((status) => <option key={status} value={status}>{getStatutLabel(status)}</option>)}</select><Modal open={Boolean(selected)} onClose={() => setSelected(undefined)} title="Confirmer le changement"><div className="space-y-5"><p className="text-sm text-slate-600">Changer le statut de <strong>{borne.identifiantUnique}</strong> vers <strong>{selected ? getStatutLabel(selected) : ''}</strong> ?</p><div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setSelected(undefined)}>Annuler</Button><Button type="button" isLoading={isLoading} onClick={confirm}>Confirmer</Button></div></div></Modal></>
}
