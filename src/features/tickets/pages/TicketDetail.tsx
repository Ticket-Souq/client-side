import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components'
import { useTickets } from '../hooks/useTickets'
import ReservationGroup from '../components/ReservationGroup'
import styles from '../styles/tickets.module.css'

export default function TicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const navigate = useNavigate()
  const { tickets, loading, error, retry } = useTickets()

  const ticket = ticketId ? tickets.find(t => t.id === ticketId) : null
  const group = ticket
    ? {
        eventTitle: ticket.eventTitle,
        eventStartDate: ticket.eventStartDate,
        eventFinishDate: ticket.eventFinishDate,
        eventPosterUrl: ticket.eventPosterUrl,
        eventStatus: ticket.eventStatus,
        tickets: tickets.filter(t => t.eventTitle === ticket.eventTitle),
      }
    : null

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

  if (!ticket || !group) {
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

      <ReservationGroup group={group} />
    </div>
  )
}
