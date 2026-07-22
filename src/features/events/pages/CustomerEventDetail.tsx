import { useParams, useNavigate } from 'react-router-dom'
import { useEvent } from '../hooks/useEvent'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { EmptyState } from '../components/EmptyState'
import { formatPrice } from '../utils/eventFormatters'

export default function CustomerEventDetail() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { event, loading, error } = useEvent(eventId ?? null)

  if (loading) {
    return (
      <div className="wrap detail-page">
        <LoadingSkeleton variant="card" count={1} />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="wrap detail-page">
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

  const tiers = event.tiers?.filter((t) => t.active) || []
  const lineup = event.lineup || []
  const priceFrom = tiers.length > 0 ? Math.min(...tiers.map((t) => t.price)) : event.priceFrom || 0

  return (
    <main className="wrap detail-page">
      <button
        onClick={() => navigate('/events')}
        className="btn btn-ghost btn-sm back-link"
        style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        &larr; Back to Events
      </button>

      <div className="ticket-card">
        <div className="ticket-art">
          <div className="beam" /><div className="beam" /><div className="beam" />
          <div className="ticket-main-content">
            <span className="ticket-tag mono">{event.category || 'Featured'}</span>
            <h1 className="ticket-title">{event.title}</h1>
            <div className="ticket-meta">
              <span>{new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} · {new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              <span>{event.venueName || 'TBD'}</span>
            </div>
          </div>
        </div>
        <div className="ticket-stub">
          <span className="stub-notch top" />
          <span className="stub-notch bottom" />
          <div className="stub-row">
            <span className="stub-label">From</span>
            <span className="stub-price">{formatPrice(priceFrom)}</span>
          </div>
          <div className="stub-row">
            <span className="stub-label">Category</span>
            <span className="stub-value">{event.category || 'General'}</span>
          </div>
          <div className="stub-row">
            <span className="stub-label">Duration</span>
            <span className="stub-value">{event.duration || '3 hours'}</span>
          </div>
          <button
            className="btn btn-primary stub-cta"
            style={{ border: 'none', cursor: 'pointer' }}
            onClick={() => {
              if (event.mode === 'ZONE_BASED') {
                navigate(`/events/${event.id}/zone-purchase`)
              } else {
                navigate(`/events/${event.id}/select`)
              }
            }}
          >
            Get Tickets
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-content">
          <section className="card-white">
            <h2 className="section-title">About this event</h2>
            <p className="detail-text">{event.description || 'No description available.'}</p>
          </section>

          {lineup.length > 0 && (
            <section className="card-white">
              <h2 className="section-title">Lineup</h2>
              <div className="lineup-grid">
                {lineup.map((artist, i) => (
                  <div key={i} className="lineup-artist">
                    <div className={`art ${['art-beams', 'art-waves', 'art-confetti', 'art-grid'][i % 4]} lineup-avatar`} />
                    <div>
                      <h3 className="lineup-name">{artist.name}</h3>
                      <p className="lineup-meta mono">{artist.stage || 'TBD'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card-white">
            <h2 className="section-title">Venue</h2>
            <div className="venue-info">
              <div className="venue-detail">
                <span className="venue-label mono">Location</span>
                <span className="venue-value">{event.venueName || 'TBD'}{event.venueAddress ? `, ${event.venueAddress}` : ''}</span>
              </div>
              <div className="venue-detail">
                <span className="venue-label mono">Capacity</span>
                <span className="venue-value">{event.capacity ? `${event.capacity.toLocaleString()}+` : 'TBD'}</span>
              </div>
              <div className="venue-detail">
                <span className="venue-label mono">Doors Open</span>
                <span className="venue-value">{event.doorsOpen || '1 hour before'}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="detail-sidebar">
          <section className="card-white">
            <h2 className="section-title">Ticket tiers</h2>
            {tiers.length > 0 ? tiers.map((tier) => (
              <div key={tier.id} className="tier-card">
                <div className="tier-head">
                  <span className={`badge ${tier.name === 'VIP' ? 'badge-yellow' : 'badge-ink'} mono`}>{tier.name}</span>
                  <span className="tier-price">{formatPrice(tier.price)}</span>
                </div>
                <ul className="tier-perks">
                  {tier.perks?.length ? tier.perks.map((p, i) => <li key={i}>{p}</li>) : <li>General admission</li>}
                </ul>
                <button
                  className={`btn ${tier.name === 'VIP' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                  style={{ width: '100%', border: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    if (event.mode === 'ZONE_BASED') {
                      navigate(`/events/${event.id}/zone-purchase`)
                    } else {
                      navigate(`/events/${event.id}/select`)
                    }
                  }}
                >
                  Select {tier.name}
                </button>
              </div>
            )) : (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No ticket tiers available</p>
            )}
          </section>

          <section className="card-white">
            <h2 className="section-title">Share event</h2>
            <div className="share-row">
              <button className="btn btn-ghost btn-sm" style={{ border: 'none', cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(window.location.href)}>Copy link</button>
              <button className="btn btn-ghost btn-sm" style={{ border: 'none', cursor: 'pointer' }} onClick={() => { if (navigator.share) navigator.share({ title: event.title, url: window.location.href }) }}>Share</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
