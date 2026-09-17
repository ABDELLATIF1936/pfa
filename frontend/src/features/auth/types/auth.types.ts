import type { Personne } from '@/features/auth/types/Personne'

export type { Personne }

export type AuthMode = 'login' | 'register'

export interface UpdateProfilePayload {
  nom?: string
  prenom?: string
  telephone?: string
  modePaiementDefaut?: 'postpaid' | 'wallet'
}

export interface RegisterPayload {
  nom: string
  prenom: string
  email: string
  motDePasse: string
  telephone?: string
}

export interface LoginPayload {
  email: string
  motDePasse: string
}

export interface AuthResponse {
  access_token: string
  user: Personne
}
