import { useState } from 'react'
import { CheckCircle2, CreditCard } from 'lucide-react'

import { Button } from '@/shared/components/Button'
import type { CarteRfid } from '@/features/cartes-rfid/types/carteRfid.types'

interface DemandeCarteFormProps {
  onSubmit: () => Promise<CarteRfid>
  onSuccess: (carte: CarteRfid) => void
  onCancel: () => void
  isLoading?: boolean
}

export function DemandeCarteForm({ onSubmit, onSuccess, onCancel, isLoading = false }: DemandeCarteFormProps) {
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    try {
      const carte = await onSubmit()
      onSuccess(carte)
    } catch {
      setError('Impossible de créer une carte RFID pour le moment. Réessayez ou contactez un administrateur.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
        <CreditCard className="mt-0.5 size-5 shrink-0 text-emerald-600" />
        <p>Votre compte sera automatiquement associé à une nouvelle carte RFID. Vous devrez ensuite récupérer la carte physique avant de l’utiliser.</p>
      </div>
      <div className="flex items-start gap-3 text-sm text-slate-600">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        <p>La carte créée sera visible immédiatement dans votre espace. Son statut réel est déterminé par le serveur.</p>
      </div>
      {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={isLoading}>Demander ma carte</Button>
      </div>
    </form>
  )
}