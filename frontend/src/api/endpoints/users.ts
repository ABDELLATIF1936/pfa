import api from '@/api/client'
import type { Personne, UpdateProfilePayload } from '@/features/auth/types/auth.types'

export async function getMe(): Promise<Personne> {
  const { data } = await api.get<Personne>('/users/me')
  return data
}

export async function updateMe(payload: UpdateProfilePayload): Promise<Personne> {
  const { data } = await api.patch<Personne>('/users/me', payload)
  return data
}

export async function uploadPhoto(file: File): Promise<{ photo_url: string }> {
  const formData = new FormData()
  formData.append('photo', file)

  const { data } = await api.post<Personne>('/users/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  if (!data.photoUrl) {
    throw new Error('Le serveur n’a pas retourné l’URL de la photo')
  }

  return { photo_url: data.photoUrl }
}