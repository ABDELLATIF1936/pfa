import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import type { TransactionWallet } from '@/features/wallet/types/wallet.types'

export function TransactionRow({ transaction }: { transaction: TransactionWallet }) {
  const isRecharge = transaction.type === 'recharge'
  const amount = Number(transaction.montant)
  return <article className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-0"><span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${isRecharge ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{isRecharge ? <ArrowUpRight className="size-5" /> : <ArrowDownLeft className="size-5" />}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{transaction.description}</p><p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(transaction.dateTransaction))}</p></div><div className="text-right"><p className={`font-mono text-sm font-bold ${isRecharge ? 'text-emerald-700' : 'text-orange-700'}`}>{isRecharge ? '+' : '-'}{amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</p><p className="mt-1 text-xs text-slate-500">Solde : {Number(transaction.soldeApres).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</p></div></article>
}