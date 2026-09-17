import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email("L'adresse email doit être valide"),
  motDePasse: z.string().min(1, 'Le mot de passe est obligatoire'),
})

export const registerSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email("L'adresse email doit être valide"),
  motDePasse: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  telephone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || value.length >= 8, {
      message: 'Le numéro de téléphone doit être valide',
    })
    .refine((value) => !value || /^[+0-9\s().-]+$/.test(value), {
      message: 'Le numéro de téléphone doit être valide',
    }),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
