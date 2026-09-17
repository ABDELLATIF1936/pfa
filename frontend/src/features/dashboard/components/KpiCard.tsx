import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'

import { Card } from '@/shared/components/Card'

interface KpiCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; positive: boolean }
}

export function KpiCard({ label, value, icon: Icon, trend }: KpiCardProps) {
  const TrendIcon = trend?.positive ? ArrowUpRight : ArrowDownRight
  return <Card className="border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>{trend ? <p className={`mt-2 flex items-center gap-1 text-xs font-semibold ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}><TrendIcon className="size-4" aria-hidden="true" />{Math.abs(trend.value)}%</p> : null}</div><span className="flex size-11 items-center justify-center rounded-xl bg-slate-900 text-emerald-300"><Icon className="size-5" aria-hidden="true" /></span></div></Card>
}