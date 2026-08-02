import { StatusBadge, type StatusBadgeOption } from '../../../shared/components/display/StatusBadge/StatusBadge'
import type { DisplayStatus } from '../types/ticket.types'

const TICKET_STATUS_OPTIONS: Record<DisplayStatus, StatusBadgeOption> = {
  confirmed: { label: 'Active', variant: 'green' },
  used: { label: 'Used', variant: 'soft' },
  expired: { label: 'Expired', variant: 'red' },
  cancelled: { label: 'Cancelled', variant: 'ink' },
}

interface Props {
  status: DisplayStatus
}

export default function TicketStatusBadge({ status }: Props) {
  return <StatusBadge status={status} options={TICKET_STATUS_OPTIONS} />
}
