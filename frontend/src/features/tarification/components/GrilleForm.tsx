import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { grilleTarifaireSchema, type GrilleTarifaireFormData } from '@/features/tarification/schemas/grilleTarifaireSchema'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'

interface GrilleFormProps {
  onSubmit: (data: GrilleTarifaireFormData) => void | Promise<void>
  isLoading?: boolean
}

export function GrilleForm({ onSubmit, isLoading = false }: GrilleFormProps) {
  const [facturerAuTemps, setFacturerAuTemps] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<GrilleTarifaireFormData>({ resolver: zodResolver(grilleTarifaireSchema), defaultValues: { prixParKwh: 0.35, dateEffective: new Date().toISOString().slice(0, 10), libelle: '' } })
  const dateEffective = watch('dateEffective')
  const isFuture = dateEffective ? new Date(`${dateEffective}T00:00:00`) > new Date() : false
  const submit: SubmitHandler<GrilleTarifaireFormData> = async (data) => onSubmit(data)

  return <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Input id="tariff-kwh" label="Prix par kWh (€)" type="number" min="0" step="0.0001" error={errors.prixParKwh?.message} {...register('prixParKwh', { valueAsNumber: true })} /><div><label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={facturerAuTemps} onChange={(event) => setFacturerAuTemps(event.target.checked)} className="size-4 accent-emerald-600" />Facturer aussi au temps</label>{facturerAuTemps ? <Input id="tariff-minute" label="Prix par minute (€)" type="number" min="0" step="0.0001" error={errors.prixParMinute?.message} {...register('prixParMinute', { valueAsNumber: true })} /> : null}</div></div><div className="grid gap-5 sm:grid-cols-2"><div><label className="flex w-full flex-col gap-1 text-sm font-medium text-slate-700" htmlFor="tariff-date">Date d’effet<input id="tariff-date" type="date" className="mt-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" {...register('dateEffective')} /></label>{errors.dateEffective ? <p className="mt-1 text-xs text-red-600">{errors.dateEffective.message}</p> : null}{isFuture ? <p className="mt-2 text-xs font-medium text-blue-700">Cette grille ne sera appliquée qu'à partir du {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${dateEffective}T00:00:00`))}, la grille actuelle reste en vigueur jusque-là.</p> : null}</div><Input id="tariff-label" label="Libellé (optionnel)" placeholder="Tarif heures creuses" error={errors.libelle?.message} {...register('libelle')} /></div>{errors.prixParKwh?.message === 'Au moins un tarif strictement positif est requis' ? <p className="text-sm text-red-600">{errors.prixParKwh.message}</p> : null}<div className="flex justify-end"><Button type="submit" isLoading={isLoading} className="gap-2"><Save className="size-4" aria-hidden="true" /> Publier la grille</Button></div></form>
}