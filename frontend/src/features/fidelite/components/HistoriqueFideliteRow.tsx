import { ArrowDown, ArrowUp } from 'lucide-react'

import type { HistoriquePointsEntry } from '@/features/fidelite/types/fidelite.types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function HistoriqueFideliteRow({ entry }: { entry: HistoriquePointsEntry }) {
  const isGain = entry.type === 'gain'
  return <article className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-b-0"><span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${isGain ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{isGain ? <ArrowUp className="size-5" aria-hidden="true" /> : <ArrowDown className="size-5" aria-hidden="true" />}</span><div className="min-w-0 flex-1"><p className="font-medium text-slate-900">{isGain ? `+${entry.points.toLocaleString('fr-FR')} points` : `-${entry.points.toLocaleString('fr-FR')} points`}</p><p className="truncate text-sm text-slate-500">{entry.description}</p></div><time dateTime={entry.dateOperation} className="shrink-0 text-right text-xs text-slate-400">{formatDate(entry.dateOperation)}</time></article>
}