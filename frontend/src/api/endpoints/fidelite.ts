import api from '@/api/client'
import type {
  CompteFidelite,
  EchangeRecompenseResponse,
  HistoriquePointsResponse,
  NiveauFidelite,
} from '@/features/fidelite/types/fidelite.types'

export async function getMonCompteFidelite(): Promise<CompteFidelite> {
  const { data } = await api.get<CompteFidelite>('/fidelite/mon-compte')
  return data
}

export async function getNiveauxFidelite(): Promise<NiveauFidelite[]> {
  const { data } = await api.get<NiveauFidelite[]>('/fidelite/niveaux-fidelite')
  return data
}

export async function getHistoriqueFidelite(filters: { page?: number } = {}): Promise<HistoriquePointsResponse> {
  const { data } = await api.get<HistoriquePointsResponse>('/fidelite/historique', { params: filters })
  return data
}

export async function echangerRecompense(recompenseId: string): Promise<EchangeRecompenseResponse> {
  const { data } = await api.post<EchangeRecompenseResponse>('/fidelite/echanger', { recompenseId })
  return data
}