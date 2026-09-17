import type { Site } from '@/features/sites/types/site.types'

export type TypeBorne = 'AC' | 'DC'
export type StatutBorne = 'disponible' | 'en_charge' | 'hors_service' | 'en_panne' | 'maintenance'

export interface Borne {
  id: string
  identifiantUnique: string
  typeBorne: TypeBorne
  puissance: number
  statut: StatutBorne
  site: Site
  siteId?: string
  qrCodeUrl?: string
  updatedAt?: string
}

export interface CreateBornePayload {
  typeBorne: TypeBorne
  puissance: number
  siteId: string
}
