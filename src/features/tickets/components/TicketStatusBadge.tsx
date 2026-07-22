import { Badge } from '../../../shared/components'
import type { TicketStatus } from '../types/ticket.types'

const statusVariant: Record<TicketStatus, 'green' | 'orange' | 'soft' | 'red' | 'ink'> = {
  confirmed: 'green',
  pending: 'orange',
  used: 'soft',
  expired: 'red',
  cancelled: 'ink',
}

const statusLabel: Record<TicketStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  used: 'Used',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

interface Props {
  status: TicketStatus
}

export default function TicketStatusBadge({ status }: Props) {
  return <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
}
