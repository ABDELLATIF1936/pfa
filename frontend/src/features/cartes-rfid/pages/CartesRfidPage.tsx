import { CreditCard, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

import { demanderNouvelleCarte, getMesCartesRfid } from '@/api/endpoints/cartesRfid'
import { CarteRfidCard } from '@/features/cartes-rfid/components/CarteRfidCard'
import { DemandeCarteForm } from '@/features/cartes-rfid/components/DemandeCarteForm'
import type { CarteRfid } from '@/features/cartes-rfid/types/carteRfid.types'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { Modal } from '@/shared/components/Modal'
import { Skeleton } from '@/shared/components/Skeleton'
import { staggerContainer } from '@/shared/utils/animations'

export function CartesRfidPage() {
  const [cartes, setCartes] = useState<CarteRfid[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  const loadCartes = async () => {
    try {
      setCartes(await getMesCartesRfid())
    } catch {
      toast.error('Impossible de charger vos cartes RFID.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadTimer = window.setTimeout(() => { void loadCartes() }, 0)
    return () => window.clearTimeout(loadTimer)
  }, [])

  const requestCard = async () => {
    setIsRequesting(true)
    try {
      return await demanderNouvelleCarte()
    } finally {
      setIsRequesting(false)
    }
  }

  const handleRequestSuccess = (carte: CarteRfid) => {
    setCartes((current) => [carte, ...current])
    setIsRequestOpen(false)
    toast.success('Votre nouvelle carte RFID a été créée.')
  }

  const updateCard = (updated: CarteRfid) => {
    setCartes((current) => current.map((carte) => carte.id === updated.id ? updated : carte))
    toast.success('Carte RFID bloquée.')
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Badge>Mon espace</Badge><h1 className="mt-3 text-3xl font-bold tracking-tight">Mes cartes RFID</h1><p className="mt-2 text-slate-500">Gérez vos cartes de recharge et bloquez rapidement une carte perdue ou volée.</p></div><Button type="button" className="gap-2" onClick={() => setIsRequestOpen(true)}><Plus className="size-4" />Demander une nouvelle carte</Button></header>
        {isLoading ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="aspect-[1.586/1]" /><Skeleton className="aspect-[1.586/1]" /></div> : cartes.length === 0 ? <EmptyState title="Aucune carte RFID" description="Demandez votre première carte pour accéder simplement au réseau Voltway." action={<Button type="button" className="gap-2" onClick={() => setIsRequestOpen(true)}><CreditCard className="size-4" />Demander ma première carte</Button>} /> : <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{cartes.map((carte) => <CarteRfidCard key={carte.id} carte={carte} onBlocked={updateCard} />)}</motion.div>}
      </div>
      <Modal open={isRequestOpen} onClose={() => !isRequesting && setIsRequestOpen(false)} title="Demander une nouvelle carte RFID"><DemandeCarteForm onSubmit={requestCard} onSuccess={handleRequestSuccess} onCancel={() => setIsRequestOpen(false)} isLoading={isRequesting} /></Modal>
    </main>
  )
}