import { z } from 'zod'

export const profileSchema = z.object({
  nom: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().trim().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  telephone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || value.length >= 8, 'Le numéro de téléphone doit être valide')
    .refine((value) => !value || /^[+0-9\s().-]+$/.test(value), 'Le numéro de téléphone doit être valide'),
})

export type ProfileFormData = z.infer<typeof profileSchema>