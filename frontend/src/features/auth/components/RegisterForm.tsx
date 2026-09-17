import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react'

import { useRegister } from '@/features/auth/hooks/useRegister'
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas/authSchemas'
import { Button } from '@/shared/components/Button'

export function RegisterForm() {
  const { register: submitRegister, loading, error } = useRegister()
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nom: '', prenom: '', email: '', motDePasse: '', telephone: '' },
  })

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    await submitRegister({ ...data, telephone: data.telephone || undefined })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="register-first-name" className="text-sm font-medium text-foreground">Prénom</label>
          <div className="relative"><UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input id="register-first-name" {...register('prenom')} autoComplete="given-name" placeholder="Jean" aria-invalid={Boolean(errors.prenom)} className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-accent-foreground focus:ring-4 focus:ring-accent/60" /></div>
          {errors.prenom ? <p className="text-xs text-red-600">{errors.prenom.message}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="register-last-name" className="text-sm font-medium text-foreground">Nom</label>
          <div className="relative"><UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input id="register-last-name" {...register('nom')} autoComplete="family-name" placeholder="Dupont" aria-invalid={Boolean(errors.nom)} className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-accent-foreground focus:ring-4 focus:ring-accent/60" /></div>
          {errors.nom ? <p className="text-xs text-red-600">{errors.nom.message}</p> : null}
        </div>
      </div>
      <div className="flex flex-col gap-2"><label htmlFor="register-email" className="text-sm font-medium text-foreground">Adresse email</label><div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input id="register-email" {...register('email')} type="email" autoComplete="email" placeholder="jean.dupont@example.com" aria-invalid={Boolean(errors.email)} className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-accent-foreground focus:ring-4 focus:ring-accent/60" /></div>{errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}</div>
      <div className="flex flex-col gap-2"><label htmlFor="register-password" className="text-sm font-medium text-foreground">Mot de passe</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input id="register-password" {...register('motDePasse')} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Minimum 8 caractères" aria-invalid={Boolean(errors.motDePasse)} className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-11 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-accent-foreground focus:ring-4 focus:ring-accent/60" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>{errors.motDePasse ? <p className="text-xs text-red-600">{errors.motDePasse.message}</p> : null}</div>
      <div className="flex flex-col gap-2"><label htmlFor="register-phone" className="text-sm font-medium text-foreground">Téléphone (optionnel)</label><div className="relative"><Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input id="register-phone" {...register('telephone')} type="tel" autoComplete="tel" placeholder="6 01 02 03 04" className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-accent-foreground focus:ring-4 focus:ring-accent/60" /></div>{errors.telephone ? <p className="text-xs text-red-600">{errors.telephone.message}</p> : null}</div>
      <Button type="submit" isLoading={loading} className="group mt-1 h-12 w-full gap-2">
        Créer mon compte
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Button>
    </form>
  )
}
