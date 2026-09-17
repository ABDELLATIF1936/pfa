import { Link } from 'react-router-dom'

import { ROUTES } from '@/routes/routes.config'

export function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-rose-600">Erreur 403</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Accès refusé</h1>
        <p className="mt-3 text-slate-600">Vous n’avez pas les droits nécessaires pour consulter cette page.</p>
        <Link
          className="mt-6 inline-flex rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
          to={ROUTES.DASHBOARD_CLIENT}
        >
          Retour à l’accueil
        </Link>
      </section>
    </main>
  )
}