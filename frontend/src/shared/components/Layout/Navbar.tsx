import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, FileText, LogOut, Menu, PlugZap, ScanLine, UserCircle, Wallet, WalletCards, X, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/features/auth/store/authStore'
import { ROUTES } from '@/routes/routes.config'

const links = [
  { href: ROUTES.DASHBOARD_CLIENT, label: 'Accueil', icon: Zap },
  { href: ROUTES.SCAN_QR, label: 'Scanner QR', icon: ScanLine },
  { href: ROUTES.SESSIONS, label: 'Mes sessions', icon: PlugZap },
  { href: ROUTES.FACTURES, label: 'Mes factures', icon: FileText },
  { href: ROUTES.CARTES_RFID, label: 'Mes cartes RFID', icon: WalletCards },
  { href: ROUTES.WALLET, label: 'Mon wallet', icon: Wallet },
  { href: ROUTES.SITES_MAP, label: 'Trouver une borne', icon: Zap },
  { href: ROUTES.FIDELITE, label: 'Fidélité', icon: Zap },
]

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(() => window.scrollY > 12)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    setMenuOpen(false)
    navigate(ROUTES.LOGIN)
  }

  const isActive = (href: string) => location.pathname === href || (href !== ROUTES.DASHBOARD_CLIENT && location.pathname.startsWith(`${href}/`))
  const initials = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase() || 'V'

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${scrolled ? 'border-emerald-900/70 bg-client-dark-bg/95 shadow-lg shadow-emerald-950/20 backdrop-blur-xl' : 'border-client-dark-muted bg-client-dark-bg'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link to={ROUTES.DASHBOARD_CLIENT} className="flex shrink-0 items-center gap-3 text-white" aria-label="Voltway accueil">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-300 to-brand-blue text-slate-950 shadow-[0_0_22px_rgba(52,211,153,.28)]"><PlugZap className="size-5" /></span>
          <span className="font-mono text-sm font-bold tracking-[.2em]">VOLTWAY</span>
        </Link>
        {isAuthenticated ? <>
          <nav className="hidden items-center gap-1 overflow-x-auto lg:flex" aria-label="Navigation client">
            {links.map(({ href, label, icon: Icon }) => <Link key={href} to={href} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${isActive(href) ? 'bg-white/12 text-primary-300' : 'text-white/60 hover:bg-white/8 hover:text-white'}`}><Icon className="size-3.5" />{label}</Link>)}
          </nav>
          <div className="relative hidden lg:block">
            <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2 rounded-full border border-white/15 px-2 py-1.5 text-sm text-white hover:bg-white/10" aria-expanded={profileOpen}><span className="flex size-8 items-center justify-center rounded-full bg-primary-300 text-xs font-bold text-slate-950">{initials}</span><ChevronDown className="size-4 text-white/60" /></button>
            {profileOpen ? <div className="absolute right-0 mt-2 w-48 rounded-xl border border-client-dark-muted bg-client-dark-surface p-1 shadow-2xl"><Link to={ROUTES.PROFILE} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10"><UserCircle className="size-4" />Profil</Link><button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-400/10"><LogOut className="size-4" />Déconnexion</button></div> : null}
          </div>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="flex size-10 items-center justify-center rounded-xl border border-white/15 text-white lg:hidden" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
        </> : <div className="flex items-center gap-2"><Link to={ROUTES.LOGIN} className="rounded-xl px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10">Se connecter</Link><Link to={ROUTES.REGISTER} className="rounded-xl bg-primary-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_22px_rgba(52,211,153,.2)] hover:bg-primary-400">S'inscrire</Link></div>}
      </div>
      <AnimatePresence>
        {menuOpen ? <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-white/10 px-4 py-3 lg:hidden" aria-label="Navigation mobile">{links.map(({ href, label, icon: Icon }) => <Link key={href} to={href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${isActive(href) ? 'bg-white/10 text-primary-300' : 'text-white/75 hover:bg-white/10'}`}><Icon className="size-4" />{label}</Link>)}<div className="mt-2 flex gap-2 border-t border-white/10 pt-3"><Link to={ROUTES.PROFILE} onClick={() => setMenuOpen(false)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white"><UserCircle className="size-4" />Profil</Link><button type="button" onClick={handleLogout} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-400/10 px-3 py-2 text-sm text-red-200"><LogOut className="size-4" />Déconnexion</button></div></motion.nav> : null}
      </AnimatePresence>
    </header>
  )
}

export function PublicNavbar() {
  return <Navbar />
}
