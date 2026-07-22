import { memo } from 'react'
import { Button } from '../../../shared/components'
import TicketStatusBadge from './TicketStatusBadge'
import type { TicketGroup, DisplayStatus } from '../types/ticket.types'
import { formatDate, formatPrice, deriveGroupDisplayStatus } from '../types/ticket.types'
import styles from '../styles/tickets.module.css'

interface Props {
  group: TicketGroup
  onViewTickets: () => void
}

function ReservationCard({ group, onViewTickets }: Props) {
  const ticketCount = group.tickets.length
  const totalPrice = group.tickets.reduce((sum, t) => sum + t.price, 0)
  const status: DisplayStatus = deriveGroupDisplayStatus(group.tickets)

  return (
    <div className={styles.resCard}>
      <div className={styles.resCardBody}>
        <div className={styles.resInfo}>
          <h2 className={styles.resEvent}>{group.eventTitle}</h2>
          <div className={styles.resMeta}>
            <span>{formatDate(group.eventStartDate)}</span>
          </div>
          <div className={styles.resSummary}>
            <span className={styles.resSeats}>{ticketCount} {ticketCount === 1 ? 'ticket' : 'tickets'}</span>
            <span className={styles.resTotal}>{formatPrice(totalPrice)}</span>
            <TicketStatusBadge status={status} />
          </div>
        </div>
        <div className={styles.resAction}>
          <Button variant="primary" size="sm" onClick={onViewTickets}>
            View Tickets
          </Button>
        </div>
      </div>
    </div>
  )
}

export default memo(ReservationCard)
