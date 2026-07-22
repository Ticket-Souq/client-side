import { Badge } from '../../../shared/components'
import type { DisplayStatus } from '../types/ticket.types'

const statusVariant: Record<DisplayStatus, 'green' | 'orange' | 'soft' | 'red' | 'ink'> = {
  confirmed: 'green',
  used: 'soft',
  expired: 'red',
  cancelled: 'ink',
}

const statusLabel: Record<DisplayStatus, string> = {
  confirmed: 'Active',
  used: 'Used',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

interface Props {
  status: DisplayStatus
}

export default function TicketStatusBadge({ status }: Props) {
  return <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
}
