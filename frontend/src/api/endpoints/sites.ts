import api from '@/api/client'
import type { CreateSitePayload, Site, UpdateSitePayload } from '@/features/sites/types/site.types'

function normalizeSite(site: Site): Site {
  return {
    ...site,
    latitude: Number(site.latitude),
    longitude: Number(site.longitude),
  }
}

export const getSites = async (): Promise<Site[]> => {
  const { data } = await api.get<Site[]>('/sites')
  return data.map(normalizeSite)
}

export const getSiteById = async (id: string): Promise<Site> => {
  const { data } = await api.get<Site>(`/sites/${id}`)
  return normalizeSite(data)
}

export const createSite = async (payload: CreateSitePayload): Promise<Site> => {
  const { data } = await api.post<Site>('/sites', payload)
  return normalizeSite(data)
}

export const updateSite = async (id: string, payload: UpdateSitePayload): Promise<Site> => {
  const { data } = await api.patch<Site>(`/sites/${id}`, payload)
  return normalizeSite(data)
}

export const deleteSite = async (id: string): Promise<void> => {
  await api.delete(`/sites/${id}`)
}
