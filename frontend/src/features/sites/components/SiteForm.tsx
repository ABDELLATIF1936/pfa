import { zodResolver } from '@hookform/resolvers/zod'
import { LocateFixed, Save } from 'lucide-react'
import { useEffect } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { SiteMap } from '@/features/sites/components/SiteMap'
import { siteSchema, type SiteFormData } from '@/features/sites/schemas/siteSchema'
import type { Site } from '@/features/sites/types/site.types'

interface SiteFormProps {
  initialData?: Site
  onSubmit: (data: SiteFormData) => void | Promise<void>
  isLoading?: boolean
}

const defaultValues: SiteFormData = { nom: '', adresse: '', ville: '', latitude: 48.8566, longitude: 2.3522 }

const roundCoordinate = (value: number) => Number(value.toFixed(7))

export function SiteForm({ initialData, onSubmit, isLoading = false }: SiteFormProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: initialData ?? defaultValues,
  })
  const [latitude, longitude] = watch(['latitude', 'longitude'])

  useEffect(() => {
    reset(initialData ?? defaultValues)
  }, [initialData, reset])

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.error('La géolocalisation n’est pas disponible sur ce navigateur.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setValue('latitude', roundCoordinate(coords.latitude), { shouldDirty: true, shouldValidate: true })
        setValue('longitude', roundCoordinate(coords.longitude), { shouldDirty: true, shouldValidate: true })
        toast.success('Position actuelle utilisée.')
      },
      () => toast.error('Impossible d’obtenir votre position.'),
    )
  }

  const handleMapPositionChange = ({ latitude: nextLatitude, longitude: nextLongitude }: { latitude: number; longitude: number }) => {
    setValue('latitude', roundCoordinate(nextLatitude), { shouldDirty: true, shouldValidate: true })
    setValue('longitude', roundCoordinate(nextLongitude), { shouldDirty: true, shouldValidate: true })
  }

  const submit: SubmitHandler<SiteFormData> = async (data) => onSubmit(data)

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input id="site-nom" label="Nom" error={errors.nom?.message} {...register('nom')} />
        <Input id="site-ville" label="Ville" error={errors.ville?.message} {...register('ville')} />
      </div>
      <Input id="site-adresse" label="Adresse" error={errors.adresse?.message} {...register('adresse')} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input id="site-latitude" label="Latitude" type="number" step="any" error={errors.latitude?.message} {...register('latitude', { valueAsNumber: true })} />
        <Input id="site-longitude" label="Longitude" type="number" step="any" error={errors.longitude?.message} {...register('longitude', { valueAsNumber: true })} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-700">Position sur la carte</p>
          <Button type="button" variant="secondary" className="gap-2" onClick={handleLocate}><LocateFixed className="size-4" aria-hidden="true" /> Localiser automatiquement</Button>
        </div>
        <SiteMap latitude={Number.isFinite(latitude) ? latitude : 0} longitude={Number.isFinite(longitude) ? longitude : 0} nom={watch('nom') || 'Nouveau site'} interactive onPositionChange={handleMapPositionChange} />
        <p className="text-xs text-slate-500">Cliquez sur la carte pour ajuster les coordonnées.</p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading} className="gap-2"><Save className="size-4" aria-hidden="true" /> Enregistrer</Button>
      </div>
    </form>
  )
}
