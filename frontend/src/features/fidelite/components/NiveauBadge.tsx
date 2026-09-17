import { Award } from 'lucide-react'

import { Badge } from '@/shared/components/Badge'

import type { NiveauFidelite } from '@/features/fidelite/types/fidelite.types'

const levelStyles: Record<string, string> = {
  bronze: 'border-orange-700/30 bg-gradient-to-br from-orange-300 via-orange-500 to-orange-800 text-white shadow-[0_0_24px_rgba(194,65,12,.3)]',
  argent: 'border-slate-400/50 bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-800 shadow-[0_0_24px_rgba(148,163,184,.4)]',
  silver: 'border-slate-400/50 bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-800 shadow-[0_0_24px_rgba(148,163,184,.4)]',
  gold: 'border-yellow-500/40 bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-700 text-yellow-950 shadow-[0_0_28px_rgba(234,179,8,.42)]',
}

export function NiveauBadge({ niveau }: { niveau: NiveauFidelite }) {
  const style = levelStyles[niveau.nom.toLowerCase()] ?? 'border-emerald-300 bg-emerald-100 text-emerald-800 shadow-[0_0_22px_rgba(52,211,153,.25)]'

  return <Badge className={`gap-2 border px-3 py-2 text-sm ${style}`}><Award className="size-4" />{niveau.nom}</Badge>
}