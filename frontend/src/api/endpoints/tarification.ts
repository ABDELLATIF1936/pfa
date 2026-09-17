import api from '@/api/client'
import type { CreateGrilleTarifairePayload, GrilleTarifaire, UpdateGrilleTarifairePayload } from '@/features/tarification/types/grilleTarifaire.types'

export async function getGrillesTarifaires(): Promise<GrilleTarifaire[]> {
  const { data } = await api.get<GrilleTarifaire[]>('/grilles-tarifaires')
  return data
}

export async function getGrilleActuelle(): Promise<GrilleTarifaire> {
  const { data } = await api.get<GrilleTarifaire>('/grilles-tarifaires/actuelle')
  return data
}

export async function createGrilleTarifaire(payload: CreateGrilleTarifairePayload): Promise<GrilleTarifaire> {
  const { data } = await api.post<GrilleTarifaire>('/grilles-tarifaires', payload)
  return data
}

export async function updateGrilleTarifaire(id: string, payload: UpdateGrilleTarifairePayload): Promise<GrilleTarifaire> {
  const { data } = await api.patch<GrilleTarifaire>(`/grilles-tarifaires/${id}`, payload)
  return data
}

export async function deleteGrilleTarifaire(id: string): Promise<GrilleTarifaire> {
  const { data } = await api.delete<GrilleTarifaire>(`/grilles-tarifaires/${id}`)
  return data
}