import { useState } from 'react'
import { Download, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

import { downloadFacturePdf } from '@/api/endpoints/factures'
import type { Facture, FactureStatus } from '@/features/factures/types/facture.types'
import { triggerPdfDownload } from '@/features/factures/utils/downloadPdf'
import { Badge, type BadgeVariant } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { fadeInUp } from '@/shared/utils/animations'

const statusConfig: Record<FactureStatus, { label: string; variant: BadgeVariant }> = {
  payee: { label: 'Payée', variant: 'success' },
  en_attente: { label: 'En attente', variant: 'warning' },
  echouee: { label: 'Échouée', variant: 'danger' },
}

const formatDate = (value: string) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value))
const formatAmount = (value: number | string) => `${Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`

export function FactureCard({ facture }: { facture: Facture }) {
  const [isDownloading, setIsDownloading] = useState(false)
  const status = statusConfig[facture.statutPaiement] ?? statusConfig.en_attente
  const session = facture.session
  const site = session?.borne?.site

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const pdf = await downloadFacturePdf(facture.id)
      triggerPdfDownload(pdf, `facture-${facture.numero}.pdf`)
      toast.success('Le téléchargement de la facture a commencé.')
    } catch {
      toast.error('Impossible de télécharger cette facture.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <motion.div variants={fadeInUp} whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="h-full">
      <Card className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Facture</p><h2 className="mt-2 font-mono text-lg font-bold text-slate-950">{facture.numero}</h2></div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <div className="mt-6 flex items-end justify-between gap-4"><div><p className="text-xs text-slate-500">Montant total</p><p className="mt-1 text-2xl font-bold text-slate-950">{formatAmount(facture.montantTotal)}</p></div><p className="text-right text-sm text-slate-500">{formatDate(facture.dateEmission)}</p></div>
        <div className="mt-5 min-h-20 border-t border-slate-100 pt-4 text-sm text-slate-600">
          {session ? <><p className="font-medium text-slate-800">{site ? `${site.nom} · ${site.ville}` : 'Session de recharge'}</p><p className="mt-2 flex items-center gap-2"><Zap className="size-4 text-amber-500" />{Number(session.energieConsommee ?? 0).toLocaleString('fr-FR')} kWh · {formatDate(session.dateDebut)}</p></> : <p>Session associée indisponible</p>}
        </div>
        <Button type="button" variant="secondary" className="mt-5 w-full gap-2" isLoading={isDownloading} onClick={() => void handleDownload}><Download className="size-4" />Télécharger PDF</Button>
      </Card>
    </motion.div>
  )
}