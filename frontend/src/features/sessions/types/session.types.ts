export interface StartSessionResponse {
  status: string
  transactionPending: boolean
  sessionId?: string
  borneId?: string
  identifiantBorne?: string
  message?: string
}

export type StartQrErrorCode = 404 | 409 | 503 | 'NETWORK' | 'UNKNOWN'

export interface StartQrError {
  code: StartQrErrorCode
  message: string
}

export interface SessionBorne {
  id?: string
  identifiantUnique: string
  statut?: string
  site?: { nom?: string; ville?: string }
}

export interface SessionDetail {
  id: string
  dateDebut: string
  dateFin?: string | null
  energieConsommee: number
  statut: 'en_cours' | 'terminee' | 'interrompue' | 'en_panne' | string
  borne: SessionBorne
  methodeAuth: string
}

export interface SessionStatus {
  energieConsommee: number
  tempsEcoule: number
  statut: SessionDetail['statut']
  borne: SessionBorne
  raison?: string
  montant?: number
}