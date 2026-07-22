import { useParams, useNavigate } from 'react-router-dom'
import { useEvent } from '../hooks/useEvent'
import { ZonePurchaseGrid } from '../components/ZonePurchaseGrid'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { EmptyState } from '../components/EmptyState'
import { MOCK_EVENTS_DETAIL } from '../data/mockEvents'

export default function ZonePurchase() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { event, loading, error } = useEvent(eventId ?? null)

  const fallbackEvent = MOCK_EVENTS_DETAIL.find((e) => e.id === eventId)

  if (loading) {
    return (
      <div className="wrap zone-page">
        <LoadingSkeleton variant="card" count={1} />
      </div>
    )
  }

  if ((error || !event) && !fallbackEvent) {
    return (
      <div className="wrap zone-page">
        <EmptyState
          title="Event not found"
          description="This event doesn't exist or has been removed."
          actionLabel="Back to events"
          onAction={() => navigate('/events')}
          icon="🎵"
        />
      </div>
    )
  }

  const current = event || fallbackEvent!
  const zones = current.zones?.length ? current.zones : [{ id: 'default', name: 'General', price: current.priceFrom || 100, spotsAvailable: 100, spotsTotal: 100, status: 'available' as const, color: '#4caf50' }]
  const tiers = current.tiers?.length ? current.tiers : []

  return (
    <main className="wrap zone-page">
      <button
        onClick={() => navigate(`/events/${current.id}`)}
        className="btn btn-ghost btn-sm back-link"
        style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        &larr; Back to event
      </button>

      <section className="page-head">
        <h1 className="page-title display">Select Your Zone</h1>
        <p className="section-sub" style={{ margin: '4px 0 0' }}>
          {current.title} · {new Date(current.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {current.venueName || 'TBD'}
        </p>
      </section>

      <ZonePurchaseGrid
        zones={zones}
        tiers={tiers}
        eventTitle={current.title}
        onContinue={(selected) => {
          navigate('/booking/checkout', {
            state: { eventId: current.id, ...selected },
          })
        }}
      />
    </main>
  )
}
