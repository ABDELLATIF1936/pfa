import { z } from 'zod'

export const grilleTarifaireSchema = z.object({
  prixParKwh: z.number().positive('Le prix doit être positif'),
  prixParMinute: z.number().min(0, 'Le prix ne peut pas être négatif').optional(),
  dateEffective: z.string().min(1, 'La date est requise'),
  libelle: z.string().optional(),
}).refine((data) => data.prixParKwh > 0 || (data.prixParMinute ?? 0) > 0, {
  message: 'Au moins un tarif strictement positif est requis',
  path: ['prixParKwh'],
})

export type GrilleTarifaireFormData = z.infer<typeof grilleTarifaireSchema>