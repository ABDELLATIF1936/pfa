import { Activity, ArrowRight, BatteryCharging, CalendarClock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { getSessions } from '@/api/endpoints/sessions'
import type { SessionDetail } from '@/features/sessions/types/session.types'
import { ROUTES } from '@/routes/routes.config'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { Skeleton } from '@/shared/components/Skeleton'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function statusLabel(status: SessionDetail['statut']) {
  if (status === 'en_cours') return 'En cours'
  if (status === 'terminee') return 'Terminée'
  if (status === 'interrompue') return 'Interrompue'
  if (status === 'en_panne') return 'En panne'
  return status
}

function statusClasses(status: SessionDetail['statut']) {
  if (status === 'en_cours') return 'bg-emerald-100 text-emerald-700'
  if (status === 'terminee') return 'bg-slate-100 text-slate-700'
  return 'bg-amber-100 text-amber-800'
}

export function SessionsListPage() {
  const [sessions, setSessions] = useState<SessionDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void getSessions()
      .then((data) => {
        if (!cancelled) setSessions(data)
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger vos sessions pour le moment.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-8 text-slate-950 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-700">Activité</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Mes sessions</h1>
            <p className="mt-2 text-slate-500">Retrouvez vos recharges et suivez une session en temps réel.</p>
          </div>
          <Link to={ROUTES.SCAN_QR}>
            <Button type="button" className="gap-2"><BatteryCharging className="size-4" />Démarrer une recharge</Button>
          </Link>
        </header>

        {error ? <EmptyState title="Sessions indisponibles" description={error} /> : isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-52 rounded-2xl" />)}</div>
        ) : sessions.length === 0 ? (
          <EmptyState title="Aucune session pour le moment" description="Vos recharges apparaîtront ici dès que vous en démarrerez une." action={<Link to={ROUTES.SCAN_QR}><Button type="button" className="gap-2"><BatteryCharging className="size-4" />Scanner une borne</Button></Link>} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map((session) => {
              const siteLabel = session.borne.site?.nom ?? session.borne.site?.ville
              return (
                <article key={session.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Activity className="size-5" /></span>
                      <div className="min-w-0"><h2 className="truncate font-semibold text-slate-900">{session.borne.identifiantUnique}</h2><p className="mt-1 flex items-center gap-1 truncate text-sm text-slate-500"><MapPin className="size-3.5" />{siteLabel ?? 'Site non renseigné'}</p></div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(session.statut)}`}>{statusLabel(session.statut)}</span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm"><div><p className="text-xs text-slate-500">Début</p><p className="mt-1 flex items-center gap-1 font-medium text-slate-700"><CalendarClock className="size-3.5" />{formatDate(session.dateDebut)}</p></div><div><p className="text-xs text-slate-500">Énergie</p><p className="mt-1 font-mono font-semibold text-slate-800">{Number(session.energieConsommee ?? 0).toFixed(3)} kWh</p></div></div>
                  <Link to={ROUTES.SESSION_DETAIL.replace(':id', session.id)} className="mt-5 flex items-center justify-end gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800">{session.statut === 'en_cours' ? 'Suivre la session' : 'Voir le détail'}<ArrowRight className="size-4" /></Link>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
