import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { useRevenueByMonth } from '@/features/dashboard/hooks/useRevenueByMonth'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { Skeleton } from '@/shared/components/Skeleton'
import { formatCurrency } from '@/shared/utils/formatCurrency'

export function RevenueChart() {
  const { data, isLoading, error } = useRevenueByMonth()
  return <Card className="p-5 sm:p-6"><h2 className="text-lg font-semibold text-slate-950">Évolution du chiffre d’affaires (6 derniers mois)</h2><div className="mt-6 h-72">{error ? <EmptyState title="Revenus indisponibles" description={error} /> : isLoading ? <Skeleton className="h-full w-full" /> : <ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="mois" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${value} €`} /><Tooltip content={<RevenueTooltip />} cursor={{ fill: '#ecfdf5' }} /><Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} /></BarChart></ResponsiveContainer>}</div></Card>
}

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return <div className="rounded-lg border border-slate-200 bg-slate-950 px-3 py-2 text-sm shadow-lg"><p className="text-slate-300">{label}</p><p className="mt-1 font-semibold text-emerald-300">{formatCurrency(Number(payload[0].value ?? 0))}</p></div>
}