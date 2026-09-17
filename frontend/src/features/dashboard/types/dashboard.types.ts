import type { Borne, StatutBorne } from '@/features/bornes/types/borne.types'

export interface BornesStatusSummary {
  disponible: number
  en_charge: number
  en_panne: number
  hors_service: number
  total: number
}

export interface ActiveSessionSummary {
  sessionId: string
  borne: { identifiantUnique: string; site: { nom: string; ville: string } }
  client: { nom: string; prenom: string }
  dateDebut: string
  dureeEcouleeMinutes: number
  energieConsommee: number
  methodeAuth: string
}

export interface BorneAlert {
  borneId: string
  identifiantUnique: string
  site: { nom: string; ville: string }
  statut: StatutBorne
  type: string
  depuisQuand: string
}

export interface DashboardOverview {
  totalBornes: number
  parStatut: Record<string, number>
  bornes: Borne[]
}
