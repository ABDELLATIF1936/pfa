import api from '@/api/client'
import type { Facture, FacturesResponse } from '@/features/factures/types/facture.types'

export interface FacturesFilters {
  page?: number
  limit?: number
  dateDebut?: string
  dateFin?: string
  siteId?: string
}

export const getFactures = async (filters: FacturesFilters = {}): Promise<{ items: Facture[]; total: number }> => {
  const { data } = await api.get<FacturesResponse>('/factures', { params: filters })
  return { items: data.items, total: data.total }
}

export const downloadFacturePdf = async (id: string): Promise<Blob> => {
  const { data } = await api.get<Blob>(`/factures/${encodeURIComponent(id)}/pdf`, {
    responseType: 'blob',
    headers: { Accept: 'application/pdf' },
  })
  return data instanceof Blob ? data : new Blob([data], { type: 'application/pdf' })
}