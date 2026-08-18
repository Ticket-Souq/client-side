import TicketCardItem from './TicketCardItem'
import { type TicketGroup } from '../types/ticket.types'
import { formatDateTime } from '../../../shared/format'
import styles from '../styles/tickets.module.css'

interface Props {
  group: TicketGroup
}

export default function ReservationGroup({ group }: Props) {

  return (
    <div className={styles.ticketGroup}>
      <div className={styles.detailHead}>
        <h1 className={styles.detailEvent}>{group.eventTitle}</h1>
        <div className={styles.detailMeta}>
          <span>{formatDateTime(group.eventStartDate)}</span>

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
