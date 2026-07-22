import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components'
import { useReservation } from '../hooks/useTickets'
import ReservationGroup from '../components/ReservationGroup'
import styles from '../styles/tickets.module.css'

export default function TicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const navigate = useNavigate()
  const { reservation, loading, error, retry } = useReservation(ticketId)

  if (loading) {
    return (
      <div className={`wrap ${styles.detailPage}`}>
        <div className={styles.loading}>Loading ticket details…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`wrap ${styles.detailPage}`}>
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="primary" onClick={retry}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className={`wrap ${styles.detailPage}`}>
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>Ticket not found</h2>
          <p>The ticket you're looking for doesn't exist or has been removed.</p>
          <Button variant="primary" onClick={() => navigate('/customer/tickets')}>
            Back to My Tickets
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`wrap ${styles.detailPage}`}>
      <Button
        variant="ghost"
        size="sm"
        className={styles.backLink}
        onClick={() => navigate('/customer/tickets')}
      >
        ← Back to My Tickets
      </Button>

      <ReservationGroup
        eventTitle={reservation.eventTitle}
        date={reservation.date}
        venue={reservation.venue}
        status={reservation.status}
        tickets={reservation.tickets}
      />
    </div>
  )
}
