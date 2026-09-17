import { z } from 'zod'

export const borneSchema = z.object({
  typeBorne: z.enum(['AC', 'DC']),
  puissance: z.number().positive('La puissance doit être positive'),
  siteId: z.string().uuid('Sélectionnez un site valide'),
})

export type BorneFormData = z.infer<typeof borneSchema>
