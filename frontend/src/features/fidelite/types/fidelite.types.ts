export interface NiveauFidelite {
  id: string
  nom: string
  seuilPoints: number
  pourcentageReduction: number
}

export interface Recompense {
  id: string
  nom: string
  coutPoints: number
  description: string
  atteignable: boolean
}

export interface CompteFidelite {
  points: number
  niveau: NiveauFidelite
  pointsProchainNiveau: number | null
  recompensesDisponibles: Recompense[]
}

export interface HistoriquePointsEntry {
  type: 'gain' | 'echange'
  points: number
  dateOperation: string
  description: string
}

export interface HistoriquePointsResponse {
  items: HistoriquePointsEntry[]
  total: number
  page: number
  limit: number
}

export interface EchangeRecompenseResponse {
  nouveauSolde: number
  recompense: Pick<Recompense, 'id' | 'nom' | 'coutPoints' | 'description'>
}