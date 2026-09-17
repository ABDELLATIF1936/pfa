import { Link, Outlet } from 'react-router-dom'
import { PlugZap } from 'lucide-react'

import { Navbar } from '@/shared/components/Layout/Navbar'
import { PageTransition } from '@/shared/components/PageTransition'
import { ROUTES } from '@/routes/routes.config'

function ClientFooter() {
  return <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><Link to={ROUTES.DASHBOARD_CLIENT} className="flex items-center gap-2 font-mono text-xs font-bold tracking-[.18em] text-slate-800"><PlugZap className="size-4 text-primary-600" />VOLTWAY</Link><nav className="flex flex-wrap gap-5" aria-label="Liens secondaires"><Link to={ROUTES.PROFILE} className="transition hover:text-slate-950">Mon profil</Link><Link to={ROUTES.FIDELITE} className="transition hover:text-slate-950">Fidélité</Link><a href="mailto:hello@voltway.fr" className="transition hover:text-slate-950">Centre d'aide</a><span>© 2026 Voltway</span></nav></div></footer>
}

export function ClientLayout() {
  return <div className="min-h-screen bg-slate-50"><Navbar /><PageTransition><Outlet /></PageTransition><ClientFooter /></div>
}
