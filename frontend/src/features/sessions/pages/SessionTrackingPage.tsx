import { CircleStop, Wifi, WifiOff } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'

import { stopSession } from '@/api/endpoints/sessions'
import { SessionEndSummary } from '@/features/sessions/components/SessionEndSummary'
import { SessionProgressCard } from '@/features/sessions/components/SessionProgressCard'
import { useSessionRealtime } from '@/features/sessions/hooks/useSessionRealtime'
import { Button } from '@/shared/components/Button'
import { ROUTES } from '@/routes/routes.config'
import { useState } from 'react'

export function SessionTrackingPage() {
  const { id } = useParams<{ id: string }>()
  const { session, status, connectionMode, error } = useSessionRealtime(id)
  const [isStopping, setIsStopping] = useState(false)
  const [stopError, setStopError] = useState<string | null>(null)

  if (error && !session) {
    return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/50 p-6"><div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xl"><p className="text-sm text-red-700">{error}</p><Link to={ROUTES.SESSIONS} className="mt-5 inline-block text-sm font-semibold text-emerald-700 hover:underline">Retour à mes sessions</Link></div></main>
  }

  if (!session || !status) {
    return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/50"><div className="size-9 animate-spin rounded-full border-4 border-slate-200 border-t-primary-500" /><span className="sr-only">Chargement du suivi...</span></main>
  }

  const isActive = status.statut === 'en_cours'
  const realtime = connectionMode === 'realtime'

  const handleStop = async () => {
    if (!id) return
    setIsStopping(true)
    setStopError(null)
    try {
      await stopSession(id)
    } catch {
      setStopError('Impossible d’arrêter la recharge. Vérifiez que la borne est connectée.')
    } finally {
      setIsStopping(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between gap-4"><Link to={ROUTES.SESSIONS} className="text-sm font-medium text-slate-500 hover:text-slate-900">← Mes sessions</Link><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${realtime ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{realtime ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}{realtime ? 'Temps réel actif' : 'Actualisation périodique'}</span></header>
        <AnimatePresence mode="wait">{isActive ? <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SessionProgressCard session={session} status={status} /><div className="mt-5 flex flex-col items-end gap-2"><Button type="button" variant="secondary" className="gap-2 border-red-200 text-red-700 hover:bg-red-50" disabled={isStopping} onClick={() => void handleStop()}><CircleStop className="size-4" />{isStopping ? 'Arrêt en cours...' : 'Arrêter la recharge'}</Button>{stopError ? <p className="text-sm text-red-700">{stopError}</p> : <p className="text-right text-xs text-slate-500">La facture sera créée après confirmation de l’arrêt par la borne.</p>}</div></motion.div> : <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SessionEndSummary session={session} status={status} /></motion.div>}</AnimatePresence>
      </div>
    </main>
  )
}
