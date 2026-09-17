import { z } from 'zod'

export const siteSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  adresse: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  ville: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

export type SiteFormData = z.infer<typeof siteSchema>
