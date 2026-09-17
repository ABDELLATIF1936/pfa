import { useState } from 'react'
import { Ban } from 'lucide-react'
import toast from 'react-hot-toast'

import { deleteGrilleTarifaire } from '@/api/endpoints/tarification'
import type { GrilleTarifaire } from '@/features/tarification/types/grilleTarifaire.types'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { Modal } from '@/shared/components/Modal'
import { formatCurrency } from '@/shared/utils/formatCurrency'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value))
}

interface GrillesHistoriqueTableProps {
  grilles: GrilleTarifaire[]
  currentId?: string
  isLoading?: boolean
  onChanged: () => void | Promise<void>
}

export function GrillesHistoriqueTable({ grilles, currentId, isLoading = false, onChanged }: GrillesHistoriqueTableProps) {
  const [selected, setSelected] = useState<GrilleTarifaire | null>(null)
  const [isDisabling, setIsDisabling] = useState(false)
  const confirmDisable = async () => {
    if (!selected) return
    setIsDisabling(true)
    try {
      await deleteGrilleTarifaire(selected.id)
      setSelected(null)
      toast.success('Grille tarifaire désactivée.')
      await onChanged()
    } catch {
      toast.error('Impossible de désactiver cette grille tarifaire.')
    } finally {
      setIsDisabling(false)
    }
  }

  return <><Card className="overflow-hidden"><div className="border-b border-slate-200 px-5 py-4"><h2 className="text-lg font-semibold text-slate-950">Historique des grilles tarifaires</h2><p className="mt-1 text-sm text-slate-500">Toutes les versions sont conservées pour garantir la traçabilité de la facturation.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Libellé</th><th className="px-5 py-3 font-semibold">Prix / kWh</th><th className="px-5 py-3 font-semibold">Prix / min</th><th className="px-5 py-3 font-semibold">Date d’effet</th><th className="px-5 py-3 font-semibold">Statut</th><th className="px-5 py-3 text-right font-semibold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{isLoading ? <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">Chargement des grilles...</td></tr> : grilles.length === 0 ? <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">Aucune grille tarifaire enregistrée.</td></tr> : grilles.slice().sort((a, b) => new Date(b.dateEffective).getTime() - new Date(a.dateEffective).getTime()).map((grille) => { const isCurrent = grille.id === currentId; return <tr key={grille.id} className={isCurrent ? 'bg-emerald-50/70' : 'bg-white'}><td className="px-5 py-4 font-medium text-slate-900">{grille.libelle || 'Sans libellé'}{isCurrent ? <span className="ml-2 text-xs font-semibold text-emerald-700">En vigueur</span> : null}</td><td className="px-5 py-4 font-mono text-slate-700">{formatCurrency(Number(grille.prixParKwh))}</td><td className="px-5 py-4 font-mono text-slate-700">{grille.prixParMinute == null ? '—' : formatCurrency(Number(grille.prixParMinute))}</td><td className="px-5 py-4 text-slate-600">{formatDate(grille.dateEffective)}</td><td className="px-5 py-4"><Badge variant={grille.actif ? 'success' : 'default'}>{grille.actif ? 'Actif' : 'Inactif'}</Badge></td><td className="px-5 py-4 text-right">{grille.actif && !isCurrent ? <Button type="button" variant="secondary" className="gap-2 text-red-700 hover:border-red-200 hover:bg-red-50" onClick={() => setSelected(grille)}><Ban className="size-4" aria-hidden="true" />Désactiver</Button> : <span className="text-xs text-slate-400">Aucune action</span>}</td></tr> })}</tbody></table></div></Card><Modal open={Boolean(selected)} onClose={isDisabling ? () => undefined : () => setSelected(null)} title="Désactiver cette grille ?"><div className="space-y-5"><p className="text-sm leading-6 text-slate-600">La grille <strong>{selected?.libelle || 'Sans libellé'}</strong> sera désactivée. Elle restera conservée dans l’historique et ne pourra plus être appliquée aux nouvelles sessions.</p><div className="flex justify-end gap-3"><Button type="button" variant="secondary" disabled={isDisabling} onClick={() => setSelected(null)}>Annuler</Button><Button type="button" isLoading={isDisabling} onClick={() => void confirmDisable()}>Désactiver</Button></div></div></Modal></>
}