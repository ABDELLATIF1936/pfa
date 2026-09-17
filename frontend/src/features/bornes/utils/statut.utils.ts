import type { BadgeVariant } from '@/shared/components/Badge'
import type { StatutBorne } from '@/features/bornes/types/borne.types'

export function getStatutVariant(statut: StatutBorne): BadgeVariant {
  if (statut === 'disponible') return 'success'
  if (statut === 'en_charge') return 'info'
  if (statut === 'maintenance') return 'warning'
  return 'danger'
}

export function getStatutLabel(statut: StatutBorne): string {
  return statut.replace('_', ' ')
}
