import { Activity, BarChart3, Percent, WalletCards } from 'lucide-react'

import { KpiCard } from '@/features/dashboard/components/KpiCard'
import { RevenueChart } from '@/features/dashboard/components/RevenueChart'
import { SessionsBySiteChart } from '@/features/dashboard/components/SessionsBySiteChart'
import { useKpis } from '@/features/dashboard/hooks/useKpis'
import { AdminNavbar } from '@/features/dashboard/components/AdminNavbar'
import { PageTransition } from '@/shared/components/PageTransition'
import { EmptyState } from '@/shared/components/EmptyState'
import { Skeleton } from '@/shared/components/Skeleton'
import { formatCurrency } from '@/shared/utils/formatCurrency'

export function StatistiquesPage() {
  const { sessionsDuJour, revenuDuMois, tauxOccupation, isLoading, error } = useKpis()
  return <><AdminNavbar /><PageTransition><main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8"><div className="mx-auto max-w-7xl space-y-8"><header><p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-700">Analyse d’activité</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Statistiques</h1><p className="mt-2 text-slate-500">Une lecture claire des revenus et de l’usage du réseau.</p></header>{error ? <EmptyState title="Indicateurs indisponibles" description={error} /> : isLoading ? <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div> : <div className="grid gap-4 md:grid-cols-3"><KpiCard label="Sessions du jour" value={sessionsDuJour.toLocaleString('fr-FR')} icon={Activity} /><KpiCard label="Revenu du mois" value={formatCurrency(revenuDuMois)} icon={WalletCards} /><KpiCard label="Taux d’occupation" value={`${tauxOccupation}%`} icon={Percent} /></div>}<div className="flex items-center gap-2"><BarChart3 className="size-5 text-emerald-600" aria-hidden="true" /><h2 className="text-xl font-semibold text-slate-900">Vue d’ensemble</h2></div><div className="grid gap-6 lg:grid-cols-2"><RevenueChart /><SessionsBySiteChart /></div></div></main></PageTransition></>
}