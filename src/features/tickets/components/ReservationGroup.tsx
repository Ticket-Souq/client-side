import TicketStatusBadge from './TicketStatusBadge'
import TicketCardItem from './TicketCardItem'
import type { TicketGroup, DisplayStatus } from '../types/ticket.types'
import { formatDate, deriveGroupDisplayStatus } from '../types/ticket.types'
import styles from '../styles/tickets.module.css'

interface Props {
  group: TicketGroup
}

export default function ReservationGroup({ group }: Props) {
  const status: DisplayStatus = deriveGroupDisplayStatus(group.tickets)

  return (
    <div className={styles.ticketGroup}>
      <div className={styles.detailHead}>
        <h1 className={styles.detailEvent}>{group.eventTitle}</h1>
        <div className={styles.detailMeta}>
          <span>{formatDate(group.eventStartDate)}</span>
          <TicketStatusBadge status={status} />
        </div>
      </div>
      <div className={styles.ticketsGrid}>
        {group.tickets.map((t) => (
          <TicketCardItem key={t.id} ticket={t} />
        ))}
      </div>
    </div>
  )
}
