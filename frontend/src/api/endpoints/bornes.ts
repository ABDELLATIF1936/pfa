import api from '@/api/client'
import type { Site } from '@/features/sites/types/site.types'
import type { Borne, CreateBornePayload, StatutBorne } from '@/features/bornes/types/borne.types'

export interface GetBornesFilters {
  siteId?: string
  statut?: StatutBorne
}

export const getBornes = async (filters?: GetBornesFilters): Promise<Borne[]> => {
  const { data } = await api.get<Borne[]>('/bornes', { params: filters })
  return data
}

export const getBorneById = async (id: string): Promise<Borne> => {
  const { data } = await api.get<Borne>(`/bornes/${id}`)
  return data
}

export const createBorne = async (payload: CreateBornePayload): Promise<Borne> => {
  const { data } = await api.post<Borne>('/bornes', payload)
  return data
}

export const updateStatutBorne = async (id: string, statut: StatutBorne): Promise<Borne> => {
  const { data } = await api.patch<Borne>(`/bornes/${id}/statut`, { statut })
  return data
}

export const getBorneQrCode = async (id: string): Promise<Blob> => {
  const { data } = await api.get<Blob>(`/bornes/${id}/qrcode`, { responseType: 'blob' })
  return data
}

export type BorneWithSite = Borne & { site: Site }
