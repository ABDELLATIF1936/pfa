import { useEffect, useState } from 'react'
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react'

import { getSites } from '@/api/endpoints/sites'
import type { FacturesFilters as FacturesFilterValues } from '@/api/endpoints/factures'
import type { Site } from '@/features/sites/types/site.types'
import { Button } from '@/shared/components/Button'

interface Props {
  value: Omit<FacturesFilterValues, 'page' | 'limit'>
  onChange: (value: Omit<FacturesFilterValues, 'page' | 'limit'>) => void
}

export function FacturesFilters({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [sites, setSites] = useState<Site[]>([])

  useEffect(() => { void getSites().then(setSites).catch(() => setSites([])) }, [])

  const update = (key: keyof Props['value'], nextValue: string) => onChange({ ...value, [key]: nextValue || undefined })
  const reset = () => onChange({})

  return <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
    <button type="button" className="flex w-full items-center justify-between gap-3 px-2 py-1 text-left font-semibold text-slate-800 md:hidden" onClick={() => setIsOpen((open) => !open)}><span className="inline-flex items-center gap-2"><SlidersHorizontal className="size-4 text-emerald-700" />Filtrer les factures</span><ChevronDown className={`size-4 transition ${isOpen ? 'rotate-180' : ''}`} /></button>
    <div className={`${isOpen ? 'mt-4' : 'hidden'} grid gap-3 md:mt-0 md:grid md:grid-cols-[1fr_1fr_1.4fr_auto] md:items-end`}>
      <label className="text-sm font-medium text-slate-700">Du<input type="date" value={value.dateDebut ?? ''} onChange={(event) => update('dateDebut', event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500" /></label>
      <label className="text-sm font-medium text-slate-700">Au<input type="date" value={value.dateFin ?? ''} onChange={(event) => update('dateFin', event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500" /></label>
      <label className="text-sm font-medium text-slate-700">Site<select value={value.siteId ?? ''} onChange={(event) => update('siteId', event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-normal outline-none focus:border-emerald-500"><option value="">Tous les sites</option>{sites.map((site) => <option key={site.id} value={site.id}>{site.nom} · {site.ville}</option>)}</select></label>
      <Button type="button" variant="secondary" className="gap-2" onClick={reset}><RotateCcw className="size-4" />Réinitialiser</Button>
    </div>
  </section>
}