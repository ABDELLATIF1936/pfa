import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BatteryCharging,
  Check,
  CreditCard,
  LocateFixed,
  Menu,
  PlugZap,
  QrCode,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'

import { getBornes } from '@/api/endpoints/bornes'
import { getSites } from '@/api/endpoints/sites'
import type { Borne } from '@/features/bornes/types/borne.types'
import type { Site } from '@/features/sites/types/site.types'
import { ROUTES } from '@/routes/routes.config'

const steps = [
  { icon: QrCode, number: '01', title: 'Scannez la borne', text: 'Utilisez votre téléphone pour scanner le QR code affiché sur la borne.' },
  { icon: Zap, number: '02', title: 'Lancez la charge', text: 'La session démarre immédiatement et vous suivez sa progression en direct.' },
  { icon: CreditCard, number: '03', title: 'Payez simplement', text: 'Réglez par wallet ou carte et gagnez des points à chaque recharge.' },
]

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sites, setSites] = useState<Site[]>([])
  const [bornes, setBornes] = useState<Borne[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSites(), getBornes()])
      .then(([loadedSites, loadedBornes]) => {
        setSites(loadedSites)
        setBornes(loadedBornes)
      })
      .catch(() => {
        setSites([])
        setBornes([])
      })
      .finally(() => setIsLoading(false))
  }, [])

  const availableBornes = bornes.filter((borne) => borne.statut === 'disponible')
  const visibleSites = useMemo(() => sites.slice(0, 3), [sites])
  const totalSites = sites.length
  const availabilityRate = bornes.length
    ? Math.round((availableBornes.length / bornes.length) * 100)
    : 0

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-client-dark-bg via-client-dark-bg to-client-dark-surface text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(16,185,129,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,.12)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div aria-hidden="true" className="absolute -left-40 top-20 size-[28rem] rounded-full bg-primary-500/15 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-40 bottom-0 size-[32rem] rounded-full bg-electric-500/15 blur-3xl" />
        {[...Array(14)].map((_, index) => (
          <motion.span key={index} aria-hidden="true" className="absolute size-1.5 rounded-full bg-emerald-300 shadow-[0_0_14px_4px_rgba(52,211,153,.45)]" style={{ left: `${(index * 37) % 100}%`, bottom: `${(index * 19) % 28}%` }} animate={{ y: [-10, -150], opacity: [0, 0.8, 0] }} transition={{ duration: 4 + (index % 3), repeat: Infinity, delay: index * 0.3, ease: 'easeOut' }} />
        ))}

      <header className="relative z-10 border-b border-white/10 bg-client-dark-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Link to={ROUTES.HOME} className="flex items-center gap-3" aria-label="Voltway accueil">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white text-slate-950"><PlugZap className="size-5" /></span>
            <span className="font-mono text-sm font-bold tracking-[0.2em]">VOLTWAY</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            <a href="#comment-ca-marche" className="transition hover:text-white">Comment ça marche</a>
            <a href="#reseau" className="transition hover:text-white">Le réseau</a>
            <a href="#fidelite" className="transition hover:text-white">Fidélité</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to={ROUTES.LOGIN} className="rounded-full px-4 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white">Se connecter</Link>
            <Link to={ROUTES.REGISTER} className="rounded-full bg-primary-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-primary-500/25 hover:bg-primary-300">Créer un compte</Link>
          </div>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="flex size-10 items-center justify-center rounded-full border border-white/15 md:hidden" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
        </div>
        {menuOpen ? <nav className="flex flex-col gap-2 border-t border-white/10 px-5 py-4 md:hidden"><a href="#comment-ca-marche" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-white/75">Comment ça marche</a><a href="#reseau" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-white/75">Le réseau</a><Link to={ROUTES.LOGIN} className="rounded-lg bg-primary-400 px-3 py-3 text-center text-sm font-semibold text-slate-950">Se connecter</Link></nav> : null}
      </header>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-14 px-5 pb-24 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-28">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
          <p className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[.22em] text-primary-300"><span className="size-2 animate-pulse rounded-full bg-primary-400" />L'énergie qui avance avec vous</p>
          <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[.98] tracking-[-.06em] sm:text-6xl lg:text-7xl">Rechargez votre véhicule, <span className="text-primary-300">sans friction.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/60">Trouvez une borne fiable, démarrez votre session en quelques secondes et reprenez la route en toute sérénité.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link to={ROUTES.SCAN_QR} className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-blue-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(52,211,153,.28)] transition hover:shadow-[0_0_42px_rgba(52,211,153,.45)]">Scanner un QR code <LocateFixed className="size-4 transition group-hover:scale-110" /></Link><a href="#reseau" className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-white/85 transition hover:bg-white/10">Voir le réseau <ArrowRight className="size-4" /></a></div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/50"><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary-300" />Paiement sécurisé</span><span className="flex items-center gap-2"><BatteryCharging className="size-4 text-primary-300" />Temps réel</span></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8, delay: .15 }} className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.06] p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          <div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.22em] text-white/40">Réseau Voltway</p><p className="mt-2 text-lg font-semibold">Bornes disponibles près de vous</p></div><span className="flex size-11 items-center justify-center rounded-full bg-primary-400 text-slate-950"><LocateFixed className="size-5" /></span></div>
          <div className="relative my-7 h-56 overflow-hidden rounded-2xl border border-white/10 bg-client-dark-bg/70 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:32px_32px]"><div className="absolute inset-8 rounded-[50%] border border-emerald-400/20" />{visibleSites.map((site, index) => <span key={site.id} className="absolute flex size-4 items-center justify-center rounded-full bg-emerald-400 shadow-[0_0_18px_5px_rgba(52,211,153,.45)]" style={{ left: `${18 + ((index * 39) % 65)}%`, top: `${24 + ((index * 31) % 52)}%` }} title={site.nom}><span className="size-1.5 rounded-full bg-client-dark-bg" /></span>)}<span className="absolute left-[43%] top-[35%] flex size-12 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-[0_0_35px_rgba(52,211,153,.5)]"><Zap className="size-6 fill-current" /></span></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4"><div className="flex items-center justify-between"><span className="text-sm text-white/60">Bornes disponibles</span><span className="font-mono text-2xl font-semibold text-emerald-300">{isLoading ? '...' : availableBornes.length.toLocaleString('fr-FR')}</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${availabilityRate}%` }} transition={{ duration: 1.2, delay: .5 }} className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" /></div><p className="mt-3 text-xs text-white/40">sur {totalSites.toLocaleString('fr-FR')} sites référencés</p></div>
        </motion.div>
      </div>
      </section>

      <section id="comment-ca-marche" className="bg-white px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><p className="font-mono text-xs uppercase tracking-[.22em] text-emerald-700">Simple comme bonjour</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.05em] text-slate-950">Votre recharge en trois étapes.</h2><div className="mt-12 grid gap-5 md:grid-cols-3">{steps.map((step, index) => <motion.article key={step.number} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ delay: index * .12 }} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6"><div className="flex items-center justify-between"><span className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><step.icon className="size-6" /></span><span className="font-mono text-sm text-slate-400">{step.number}</span></div><h3 className="mt-8 text-lg font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p></motion.article>)}</div></div></section>
      <section className="border-y border-emerald-900/10 bg-gradient-to-r from-emerald-950 via-client-dark-surface to-blue-950 px-5 py-12 text-white lg:px-8"><div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-3"><Stat value={totalSites.toLocaleString('fr-FR')} label="sites accessibles" /><Stat value={availableBornes.length.toLocaleString('fr-FR')} label="bornes disponibles" /><Stat value={`${availabilityRate}%`} label="de disponibilité" /></div></section>
      <section id="reseau" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono text-xs uppercase tracking-[.22em] text-emerald-700">Notre réseau</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.05em]">Toujours une borne sur votre route.</h2></div><a href="#reseau" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">Voir les sites <ArrowRight className="size-4" /></a></div><div className="mt-10 grid gap-4 md:grid-cols-3">{visibleSites.map((site) => { const siteBornes = bornes.filter((borne) => borne.siteId === site.id || borne.site?.id === site.id); const available = siteBornes.filter((borne) => borne.statut === 'disponible').length; return <article key={site.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><PlugZap className="size-5" /></span><span className="flex items-center gap-2 text-xs text-slate-500"><span className={`size-2 rounded-full ${available ? 'bg-emerald-500' : 'bg-amber-500'}`} />{available} disponible{available === 1 ? '' : 's'}</span></div><h3 className="mt-7 font-semibold">{site.nom}</h3><p className="mt-1 text-sm text-slate-500">{site.adresse}, {site.ville}</p><div className="mt-5 flex justify-between border-t border-slate-100 pt-4 text-xs text-slate-500"><span>{siteBornes.length} borne{siteBornes.length === 1 ? '' : 's'}</span><span className="flex items-center gap-1">Disponible <Check className="size-3 text-emerald-600" /></span></div></article> })}</div></section>
      <section id="fidelite" className="mx-5 mb-20 overflow-hidden rounded-[2rem] bg-client-dark-bg px-6 py-12 text-white lg:mx-auto lg:max-w-7xl lg:px-12 lg:py-16"><div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]"><div><p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[.2em] text-emerald-300"><Sparkles className="size-4" />Programme Voltway+</p><h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-.05em]">Chaque recharge vous rapproche de votre prochain avantage.</h2><p className="mt-5 max-w-lg leading-7 text-white/55">Cumulez des points, débloquez des niveaux et profitez d'avantages exclusifs sur tout le réseau.</p><Link to={ROUTES.REGISTER} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300">Rejoindre Voltway+ <ArrowRight className="size-4" /></Link></div><div className="flex items-center gap-3"><span className="flex size-20 items-center justify-center rounded-full border border-amber-300/40 bg-amber-300/10 text-xs font-bold text-amber-200">BRONZE</span><span className="flex size-24 items-center justify-center rounded-full border border-slate-300/40 bg-slate-300/10 text-xs font-bold text-slate-200">ARGENT</span><span className="flex size-28 items-center justify-center rounded-full border border-emerald-300/50 bg-emerald-300/10 text-xs font-bold text-emerald-200">GOLD</span></div></div></section>
      <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div className="flex items-center gap-2 font-mono text-xs font-bold tracking-[.18em] text-slate-800"><PlugZap className="size-4" />VOLTWAY</div><div className="flex flex-wrap gap-5"><Link to={ROUTES.PROFILE} className="hover:text-slate-950">Mon profil</Link><Link to={ROUTES.ADMIN_DASHBOARD} className="hover:text-slate-950">Administration</Link><a href="mailto:hello@voltway.fr" className="hover:text-slate-950">Centre d'aide</a><span>© 2026 Voltway</span></div></div></footer>
    </main>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return <div><p className="font-mono text-3xl font-semibold text-emerald-300">{value}</p><p className="mt-1 text-sm text-white/55">{label}</p></div>
}
