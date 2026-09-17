export type CarteRfidStatus =
  | 'active'
  | 'bloquee'
  | 'inactive'
  | 'desactivee'
  | 'perdue'

export interface CarteRfid {
  id: string
  identifiantUnique: string
  statut: CarteRfidStatus
  dateActivation: string
}