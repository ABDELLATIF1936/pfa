import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { getSites } from '@/api/endpoints/sites'
import { borneSchema, type BorneFormData } from '@/features/bornes/schemas/borneSchema'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import type { Site } from '@/features/sites/types/site.types'

interface BorneFormProps {
  onSubmit: (data: BorneFormData) => void | Promise<void>
  isLoading?: boolean
}

export function BorneForm({ onSubmit, isLoading = false }: BorneFormProps) {
  const [sites, setSites] = useState<Site[]>([])
  const [sitesError, setSitesError] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm<BorneFormData>({
    resolver: zodResolver(borneSchema),
    defaultValues: { typeBorne: 'AC', puissance: 22, siteId: '' },
  })

  useEffect(() => {
    getSites().then(setSites).catch(() => setSitesError('Impossible de charger les sites.'))
  }, [])

  const submit: SubmitHandler<BorneFormData> = async (data) => onSubmit(data)

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      <label className="flex w-full flex-col gap-1 text-sm font-medium text-slate-700" htmlFor="borne-type">Type de borne<select id="borne-type" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" {...register('typeBorne')}><option value="AC">AC</option><option value="DC">DC</option></select>{errors.typeBorne ? <span className="text-xs text-red-600">{errors.typeBorne.message}</span> : null}</label>
      <Input id="borne-power" label="Puissance (kW)" type="number" step="0.01" error={errors.puissance?.message} {...register('puissance', { valueAsNumber: true })} />
      <label className="flex w-full flex-col gap-1 text-sm font-medium text-slate-700" htmlFor="borne-site">Site<select id="borne-site" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" {...register('siteId')}><option value="">Sélectionner un site</option>{sites.map((site) => <option key={site.id} value={site.id}>{site.nom} - {site.ville}</option>)}</select>{errors.siteId ? <span className="text-xs text-red-600">{errors.siteId.message}</span> : null}</label>
      {sitesError ? <p className="text-sm text-red-600" role="alert">{sitesError}</p> : null}
      <div className="flex justify-end"><Button type="submit" isLoading={isLoading} className="gap-2"><Save className="size-4" aria-hidden="true" /> Enregistrer la borne</Button></div>
    </form>
  )
}
