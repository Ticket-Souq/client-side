import { memo } from 'react'
import { Button } from '../../../shared/components'
import TicketStatusBadge from './TicketStatusBadge'
import type { TicketStatus } from '../types/ticket.types'
import styles from '../styles/tickets.module.css'

interface Props {
  eventTitle: string
  date: string
  venue: string
  ticketCount: number
  totalPrice: string
  status: TicketStatus
  onViewTickets: () => void
}

function ReservationCard({ eventTitle, date, venue, ticketCount, totalPrice, status, onViewTickets }: Props) {
  return (
    <div className={styles.resCard}>
      <div className={styles.resCardBody}>
        <div className={styles.resInfo}>
          <h2 className={styles.resEvent}>{eventTitle}</h2>
          <div className={styles.resMeta}>
            <span>{date}</span>
            <span>{venue}</span>
          </div>
          <div className={styles.resSummary}>
            <span className={styles.resSeats}>{ticketCount} {ticketCount === 1 ? 'ticket' : 'tickets'}</span>
            <span className={styles.resTotal}>{totalPrice}</span>
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
