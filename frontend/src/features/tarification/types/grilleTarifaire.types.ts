export interface GrilleTarifaire {
  id: string
  prixParKwh: number
  prixParMinute?: number | null
  dateEffective: string
  libelle?: string | null
  actif: boolean
  created_at?: string
}

export interface CreateGrilleTarifairePayload {
  prixParKwh: number
  prixParMinute?: number
  dateEffective: string
  libelle?: string
}

export interface UpdateGrilleTarifairePayload {
  prixParKwh?: number
  prixParMinute?: number
  dateEffective?: string
  libelle?: string
  actif?: boolean
}