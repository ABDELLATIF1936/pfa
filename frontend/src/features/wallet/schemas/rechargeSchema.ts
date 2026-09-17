import { z } from 'zod'

export const rechargeSchema = z.object({
  montant: z.number({ message: 'Saisissez un montant valide' }).positive('Le montant doit être supérieur à 0').min(10, 'Le montant minimum de recharge est de 10 MAD'),
})

export type RechargeFormValues = z.infer<typeof rechargeSchema>