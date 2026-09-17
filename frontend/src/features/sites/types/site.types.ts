export interface Site {
  id: string
  nom: string
  adresse: string
  ville: string
  latitude: number
  longitude: number
}

export type CreateSitePayload = Omit<Site, 'id'>
export type UpdateSitePayload = Partial<CreateSitePayload>
