import { useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components'
import { useTickets } from '../hooks/useTickets'
import ReservationCard from '../components/ReservationCard'
import styles from '../styles/tickets.module.css'

export default function MyTickets() {
  const navigate = useNavigate()
  const { groups, loading, error, retry } = useTickets()

  const upcomingCount = groups.filter((g) =>
    g.tickets.some((t) => !t.consumed && t.reservationStatus === 'ACTIVE')
  ).length

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

  if (groups.length === 0) {
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
        {upcomingCount > 0 && <span className={styles.notifCount}>{upcomingCount} upcoming</span>}
      </section>

      <div className={styles.reservationList} role="list">
        {groups.map((g) => (
          <ReservationCard
            key={g.eventTitle}
            group={g}
            onViewTickets={() => navigate(`/customer/tickets/${g.tickets[0].id}`)}
          />
        ))}
      </div>
    </div>
  )
}
