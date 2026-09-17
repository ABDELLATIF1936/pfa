import api from '@/api/client'
import type { CarteRfid } from '@/features/cartes-rfid/types/carteRfid.types'

export async function getMesCartesRfid(): Promise<CarteRfid[]> {
  const { data } = await api.get<CarteRfid[]>('/cartes-rfid')
  return data
}

export async function demanderNouvelleCarte(): Promise<CarteRfid> {
  const { data } = await api.post<CarteRfid>('/cartes-rfid', {})
  return data
}

export async function bloquerCarte(id: string): Promise<CarteRfid> {
  const { data } = await api.patch<CarteRfid>(`/cartes-rfid/${id}/bloquer`)
  return data
}