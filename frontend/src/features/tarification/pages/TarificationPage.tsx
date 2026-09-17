import { Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { createGrilleTarifaire, getGrilleActuelle, getGrillesTarifaires } from '@/api/endpoints/tarification'
import { GrilleActuelleCard } from '@/features/tarification/components/GrilleActuelleCard'
import { GrilleForm } from '@/features/tarification/components/GrilleForm'
import { GrillesHistoriqueTable } from '@/features/tarification/components/GrillesHistoriqueTable'
import type { GrilleTarifaire } from '@/features/tarification/types/grilleTarifaire.types'
import type { GrilleTarifaireFormData } from '@/features/tarification/schemas/grilleTarifaireSchema'
import { AdminNavbar } from '@/features/dashboard/components/AdminNavbar'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { Modal } from '@/shared/components/Modal'
import { PageTransition } from '@/shared/components/PageTransition'
import { Skeleton } from '@/shared/components/Skeleton'

export function TarificationPage() {
  const [current, setCurrent] = useState<GrilleTarifaire | null>(null)
  const [grilles, setGrilles] = useState<GrilleTarifaire[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [currentResponse, grillesResponse] = await Promise.all([getGrilleActuelle(), getGrillesTarifaires()])
      setCurrent(currentResponse)
      setGrilles(grillesResponse)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Impossible de charger les grilles tarifaires.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleCreate = async (data: GrilleTarifaireFormData) => {
    setIsSaving(true)
    try {
      await createGrilleTarifaire({ ...data, dateEffective: new Date(`${data.dateEffective}T00:00:00`).toISOString(), prixParMinute: data.prixParMinute === undefined ? undefined : data.prixParMinute })
      setFormOpen(false)
      toast.success('Nouvelle grille tarifaire créée.')
      await load()
    } catch {
      toast.error('Impossible de créer la grille tarifaire.')
    } finally {
      setIsSaving(false)
    }
  }

  return <><AdminNavbar /><PageTransition><main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8"><div className="mx-auto max-w-7xl space-y-8"><header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Badge>Administration</Badge><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Tarification</h1><p className="mt-2 text-slate-500">Gérez les tarifs appliqués aux recharges et conservez leur historique.</p></div><Button type="button" className="gap-2" onClick={() => setFormOpen(true)}><Plus className="size-4" aria-hidden="true" />Définir une nouvelle grille tarifaire</Button></header>{error ? <EmptyState title="Tarification indisponible" description={error} action={<Button type="button" variant="secondary" onClick={() => void load()}>Réessayer</Button>} /> : isLoading ? <Skeleton className="h-[30rem]" /> : current ? <GrilleActuelleCard grille={current} /> : <EmptyState title="Aucune grille actuelle" description="Créez une première grille tarifaire pour activer la facturation." />}<GrillesHistoriqueTable grilles={grilles} currentId={current?.id} isLoading={isLoading} onChanged={load} /></div></main></PageTransition><Modal open={formOpen} onClose={isSaving ? () => undefined : () => setFormOpen(false)} title="Définir une nouvelle grille tarifaire"><GrilleForm onSubmit={handleCreate} isLoading={isSaving} /></Modal></>
}