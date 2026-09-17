import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { getTopSites } from '@/api/endpoints/dashboard'
import type { TopSite } from '@/features/dashboard/types/stats.types'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { Skeleton } from '@/shared/components/Skeleton'

export function SessionsBySiteChart() {
  const [sites, setSites] = useState<TopSite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void getTopSites({ limit: 10 }).then((response) => {
      if (active) setSites(response.slice().sort((a, b) => b.nombreSessions - a.nombreSessions))
    }).catch((requestError) => {
      if (active) setError(requestError instanceof Error ? requestError.message : 'Impossible de charger les sessions par site.')
    }).finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  return <Card className="p-5 sm:p-6"><h2 className="text-lg font-semibold text-slate-950">Répartition des sessions par site</h2><div className="mt-6 h-72">{error ? <EmptyState title="Sessions indisponibles" description={error} /> : isLoading ? <Skeleton className="h-full w-full" /> : sites.length === 0 ? <EmptyState title="Aucune session" description="Les sessions apparaîtront ici dès qu’elles seront enregistrées." /> : <ResponsiveContainer width="100%" height="100%"><BarChart data={sites} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" /><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} /><YAxis type="category" dataKey="nom" width={90} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} /><Tooltip formatter={(value: unknown) => { const count = Number(value ?? 0); return [`${count} session${count > 1 ? 's' : ''}`, 'Sessions'] }} /><Bar dataKey="nombreSessions" fill="#2563eb" radius={[0, 6, 6, 0]} maxBarSize={28} /></BarChart></ResponsiveContainer>}</div></Card>
}