import { Link } from 'react-router-dom'
import { ArrowUpRight, WalletCards } from 'lucide-react'

import type { Personne } from '@/features/auth/types/auth.types'
import { ROUTES } from '@/routes/routes.config'

interface WalletInfoCardProps {
  profile: Personne
}

export function WalletInfoCard({ profile }: WalletInfoCardProps) {
  if (profile.type !== 'client') return null

  const paymentLabel = profile.modePaiementDefaut === 'wallet' ? 'Wallet prépayé' : 'Paiement postpayé'
  const balance = (profile.soldeWallet ?? 0).toFixed(2)

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground"><WalletCards className="size-5" aria-hidden="true" /></span>
          <div><p className="text-sm font-medium text-muted-foreground">Solde wallet</p><p className="mt-1 text-3xl font-bold text-foreground">{balance} MAD</p><p className="mt-1 text-sm text-muted-foreground">{paymentLabel}</p></div>
        </div>
        <Link className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" to={ROUTES.WALLET}>
          Gérer le wallet <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}