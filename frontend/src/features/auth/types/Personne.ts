export interface Personne {
  id: string
  nom: string
  prenom: string
  email: string
  telephone?: string | null
  photoUrl?: string | null
  type: 'client' | 'administrateur'
  soldeWallet?: number | null
  modePaiementDefaut?: 'postpaid' | 'wallet' | null
  dateInscription?: string | null
  createdAt?: string
  updatedAt?: string
}
