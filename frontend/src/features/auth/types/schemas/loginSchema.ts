import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide.'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

/*
 * Pattern attendu pour les formulaires du projet :
 * const form = useForm<LoginFormValues>({
 *   resolver: zodResolver(loginSchema),
 *   defaultValues: { email: '', password: '' },
 * })
 */
