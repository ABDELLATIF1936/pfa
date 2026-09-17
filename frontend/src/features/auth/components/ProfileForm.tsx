import { zodResolver } from '@hookform/resolvers/zod'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { Save } from 'lucide-react'

import { useProfile } from '@/features/auth/hooks/useProfile'
import { profileSchema, type ProfileFormData } from '@/features/auth/schemas/profileSchema'
import type { Personne } from '@/features/auth/types/auth.types'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'

interface ProfileFormProps {
  profile: Personne
  updateProfile: ReturnType<typeof useProfile>['updateProfile']
  error: string | null
}

export function ProfileForm({ profile, updateProfile, error }: ProfileFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { nom: profile.nom, prenom: profile.prenom, telephone: profile.telephone ?? '' },
  })

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    await updateProfile({ ...data, telephone: data.telephone || undefined })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Input id="profile-prenom" label="Prénom" autoComplete="given-name" error={errors.prenom?.message} {...register('prenom')} />
        <Input id="profile-nom" label="Nom" autoComplete="family-name" error={errors.nom?.message} {...register('nom')} />
      </div>
      <Input id="profile-telephone" label="Téléphone" type="tel" autoComplete="tel" error={errors.telephone?.message} {...register('telephone')} />
      <div>
        <Input id="profile-email" label="Adresse email" type="email" value={profile.email} disabled readOnly />
        <p className="mt-1.5 text-xs text-muted-foreground">L’adresse email ne peut pas être modifiée ici.</p>
      </div>
      <Button type="submit" isLoading={isSubmitting} disabled={!isDirty} className="gap-2">
        <Save className="size-4" aria-hidden="true" />
        Enregistrer les modifications
      </Button>
    </form>
  )
}
