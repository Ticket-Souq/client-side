import TicketStatusBadge from './TicketStatusBadge'
import TicketCardItem from './TicketCardItem'
import type { TicketStatus, TicketData } from '../types/ticket.types'
import styles from '../styles/tickets.module.css'

interface Props {
  eventTitle: string
  date: string
  venue: string
  status: TicketStatus
  tickets: TicketData[]
}

export default function ReservationGroup({ eventTitle, date, venue, status, tickets }: Props) {
  return (
    <div className={styles.ticketGroup}>
      <div className={styles.detailHead}>
        <h1 className={styles.detailEvent}>{eventTitle}</h1>
        <div className={styles.detailMeta}>
          <span>{date}</span>
          <span>{venue}</span>
          <TicketStatusBadge status={status} />
        </div>
      </div>
      <div className={styles.ticketsGrid}>
        {tickets.map((t) => (
          <TicketCardItem key={t.id} {...t} />
        ))}
      </div>
    </div>
  )
}
