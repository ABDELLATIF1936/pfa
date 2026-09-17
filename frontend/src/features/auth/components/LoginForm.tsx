import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'

import { useLogin } from '@/features/auth/hooks/useLogin'
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/authSchemas'
import { Button } from '@/shared/components/Button'

export function LoginForm() {
  const { login, loading, error } = useLogin()
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', motDePasse: '' },
  })

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    await login(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div> : null}
      <div className="flex flex-col gap-2">
        <label htmlFor="login-email" className="text-sm font-medium text-foreground">Adresse email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input id="login-email" {...register('email')} type="email" autoComplete="email" placeholder="jean.dupont@example.com" aria-invalid={Boolean(errors.email)} className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-accent-foreground focus:ring-4 focus:ring-accent/60" />
        </div>
        {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="login-password" className="text-sm font-medium text-foreground">Mot de passe</label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input id="login-password" {...register('motDePasse')} type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" aria-invalid={Boolean(errors.motDePasse)} className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-11 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-accent-foreground focus:ring-4 focus:ring-accent/60" />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.motDePasse ? <p className="text-xs text-red-600">{errors.motDePasse.message}</p> : null}
        <div className="flex justify-end"><button type="button" className="text-xs font-medium text-accent-foreground hover:underline">Mot de passe oublié ?</button></div>
      </div>
      <Button type="submit" isLoading={loading} className="group mt-1 h-12 w-full gap-2">
        Se connecter
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Button>
    </form>
  )
}
