export interface RevenueStats {
  revenue: number
  nombreFactures: number
  periode: { dateDebut: string | null; dateFin: string | null }
}

export interface SessionsStats {
  nombreSessions: number
  dureeMoyenneMinutes: number
  energieMoyenneKwh: number
  repartitionParStatut: Record<string, number>
}

export interface TopSite {
  siteId: string
  nom: string
  ville: string
  nombreSessions: number
  revenue: number
  energieTotaleKwh: number
}

export interface RevenueByMonth {
  mois: string
  revenue: number
}