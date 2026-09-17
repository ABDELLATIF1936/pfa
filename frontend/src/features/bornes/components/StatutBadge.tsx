import { Badge } from '@/shared/components/Badge'
import type { StatutBorne } from '@/features/bornes/types/borne.types'
import {
  getStatutLabel,
  getStatutVariant,
} from '@/features/bornes/utils/statut.utils'

type StatutBadgeProps = {
  statut: StatutBorne
}

export function StatutBadge({ statut }: StatutBadgeProps) {
  return (
    <Badge variant={getStatutVariant(statut)}>
      {getStatutLabel(statut)}
    </Badge>
  )
}