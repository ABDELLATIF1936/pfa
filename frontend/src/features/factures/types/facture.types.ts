export type FactureStatus = 'en_attente' | 'payee' | 'echouee'

export interface FactureSession {
  id: string
  dateDebut: string
  dateFin: string | null
  energieConsommee: number | string | null
  borne?: {
    identifiantUnique: string
    site?: {
      id: string
      nom: string
      ville: string
    }
  }
}

export interface Facture {
  id: string
  numero: string
  montantTotal: number | string
  dateEmission: string
  statutPaiement: FactureStatus
  session?: FactureSession | null
}

export interface FacturesResponse {
  items: Facture[]
  page: number
  limit: number
  total: number
  totalPages: number
}