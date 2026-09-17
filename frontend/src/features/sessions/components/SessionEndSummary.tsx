import { AlertTriangle, ArrowLeft, CheckCircle2, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import type { SessionDetail, SessionStatus } from '@/features/sessions/types/session.types'
import { ROUTES } from '@/routes/routes.config'
import { Button } from '@/shared/components/Button'

interface SessionEndSummaryProps {
  session: SessionDetail
  status: SessionStatus
}

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remaining = safeSeconds % 60
  return hours > 0 ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}` : `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
}

export function SessionEndSummary({ session, status }: SessionEndSummaryProps) {
  const interrupted = status.statut === 'interrompue' || status.statut === 'en_panne'
  const duration = status.tempsEcoule || (session.dateFin ? Math.floor((new Date(session.dateFin).getTime() - new Date(session.dateDebut).getTime()) / 1000) : 0)

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl sm:p-10">
      <motion.div initial={{ scale: .7 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className={`mx-auto flex size-16 items-center justify-center rounded-full ${interrupted ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{interrupted ? <AlertTriangle className="size-8" /> : <CheckCircle2 className="size-8" />}</motion.div>
      <h1 className="mt-5 text-2xl font-bold text-slate-900">{interrupted ? 'Charge interrompue' : 'Charge terminée'}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{interrupted ? `Votre charge a été interrompue : ${status.raison ?? 'la borne a signalé un incident.'}` : 'Votre session de recharge est terminée. Voici son récapitulatif.'}</p>
      <div className="mx-auto mt-8 grid max-w-lg gap-3 text-left sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Énergie</p><p className="mt-1 font-mono text-xl font-semibold">{Number(status.energieConsommee || session.energieConsommee || 0).toFixed(3)} kWh</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Durée</p><p className="mt-1 font-mono text-xl font-semibold">{formatDuration(duration)}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Montant facturé</p><p className="mt-1 font-mono text-xl font-semibold">{typeof status.montant === 'number' ? `${status.montant.toFixed(2)} MAD` : 'Voir la facture'}</p></div></div>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to={ROUTES.FACTURES}><Button type="button" className="w-full gap-2 sm:w-auto"><FileText className="size-4" />Voir ma facture</Button></Link><Link to={ROUTES.DASHBOARD_CLIENT}><Button type="button" variant="secondary" className="w-full gap-2 sm:w-auto"><ArrowLeft className="size-4" />Retour à l’accueil</Button></Link></div>
    </motion.section>
  )
}
