import { BarChart3, LayoutDashboard, MapPinned, PlugZap, UserCircle, WalletCards } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { ROUTES } from '@/routes/routes.config'

const links = [
  { href: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.ADMIN_BORNES, label: 'Bornes', icon: PlugZap },
  { href: ROUTES.ADMIN_SITES, label: 'Sites', icon: MapPinned },
  { href: ROUTES.ADMIN_STATS, label: 'Statistiques', icon: BarChart3 },
  { href: ROUTES.ADMIN_GRILLES_TARIFAIRES, label: 'Tarification', icon: WalletCards },
  { href: ROUTES.ADMIN_PROFILE, label: 'Profil', icon: UserCircle },
]

export function AdminNavbar() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Link to={ROUTES.ADMIN_DASHBOARD} className="flex items-center gap-3 text-slate-950" aria-label="Voltway administration">
          <span className="flex size-9 items-center justify-center rounded-xl bg-slate-950 text-white"><PlugZap className="size-4" aria-hidden="true" /></span>
          <span className="font-mono text-sm font-bold tracking-[0.18em]">VOLTWAY</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation administrateur">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = location.pathname === href || (href !== ROUTES.ADMIN_DASHBOARD && location.pathname.startsWith(`${href}/`))
            return <Link key={href} to={href} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}><Icon className="size-4" aria-hidden="true" />{label}</Link>
          })}
        </nav>
        <Link to={ROUTES.ADMIN_PROFILE} className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><UserCircle className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Admin</span></Link>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 md:hidden" aria-label="Navigation administrateur mobile">
        {links.map(({ href, label, icon: Icon }) => <Link key={href} to={href} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${location.pathname === href ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-600'}`}><Icon className="size-4" aria-hidden="true" />{label}</Link>)}
      </nav>
    </header>
  )
}

export function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-50"><AdminNavbar />{children}</div>
}
