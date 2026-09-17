import type { Borne } from '@/features/bornes/types/borne.types'
import { BorneGridCell } from '@/features/dashboard/components/BorneGridCell'

export function BornesGrid({ bornes }: { bornes: Borne[] }) {
  const groups = bornes.reduce<Record<string, Borne[]>>((result, borne) => { const key = borne.site.nom; (result[key] ??= []).push(borne); return result }, {})
  return <div className="space-y-6">{Object.entries(groups).map(([site, siteBornes]) => <section key={site}><h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{site}</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{siteBornes.map((borne) => <BorneGridCell key={borne.id} borne={borne} />)}</div></section>)}</div>
}
