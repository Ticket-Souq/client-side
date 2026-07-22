import { useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components'
import { useReservations } from '../hooks/useTickets'
import ReservationCard from '../components/ReservationCard'
import styles from '../styles/tickets.module.css'

export default function MyTickets() {
  const navigate = useNavigate()
  const { reservations, loading, error, retry } = useReservations()

  const upcoming = reservations.filter((r) => r.status === 'confirmed' || r.status === 'pending').length

  if (loading) {
    return (
      <div className={`wrap ${styles.page}`}>
        <div className={styles.loading}>Loading your tickets…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`wrap ${styles.page}`}>
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="primary" onClick={retry}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (reservations.length === 0) {
    return (
      <div className={`wrap ${styles.page}`}>
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>No tickets yet</h2>
          <p>Your purchased tickets will appear here.</p>
          <Button variant="primary" onClick={() => navigate('/customer/events')}>
            Browse Events
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`wrap ${styles.page}`}>
      <section className={styles.pageHead}>
        <h1 className={styles.pageTitle}>My Tickets</h1>
        {upcoming > 0 && <span className={styles.notifCount}>{upcoming} upcoming</span>}
      </section>

      <div className={styles.reservationList} role="list">
        {reservations.map((r) => (
          <ReservationCard
            key={r.id}
            eventTitle={r.eventTitle}
            date={r.date}
            venue={r.venue}
            ticketCount={r.ticketCount}
            totalPrice={r.totalPrice}
            status={r.status}
            onViewTickets={() => navigate(`/customer/tickets/${r.id}`)}
          />
        ))}
      </div>
    </div>
  )
}
