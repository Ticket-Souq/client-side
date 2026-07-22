import { Badge } from '../../../shared/components/display/Badge/Badge'
import type { EventStatus } from '../types/event.types'
import { STATUS_MAP } from '../constants/statuses'

interface Props {
  status: EventStatus
}

const variantMap: Record<string, 'yellow' | 'ink' | 'soft' | 'green' | 'red' | 'orange'> = {
  soft: 'soft',
  solid: 'ink',
}

export function StatusBadge({ status }: Props) {
  const config = STATUS_MAP[status] ?? { label: status, variant: 'soft' as const }
  const badgeVariant = variantMap[config.variant] ?? 'soft'
  return <Badge variant={badgeVariant}>{config.label}</Badge>
}
