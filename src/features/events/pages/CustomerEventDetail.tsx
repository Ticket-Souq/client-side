import { useParams, useNavigate } from 'react-router-dom'
import { useEvent } from '../hooks/useEvent'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { EmptyState } from '../components/EmptyState'
import { formatEventDate, formatPrice } from '../../../shared/format'
import { API } from '../../../shared/api'

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
          actionLabel="Back to home"
          onAction={() => navigate('/')}
          icon="🎵"
        />
      </div>
    )
  }

  const bannerSrc = event.bannerUrl
    ? `${API.base}${event.bannerUrl}`
    : event.PosterUrl
      ? `${API.base}${event.PosterUrl}`
      : null

  return (
    <main className="wrap detail-page">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        {bannerSrc && (
          <div style={{ width: '100%', height: 420, overflow: 'hidden', background: '#15150f', borderRadius: 20, marginTop: 24 }}>
            <img
              src={bannerSrc}
              alt={event.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 32, marginBottom: 24 }}>
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost btn-sm"
            style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
          >
            &larr; Back
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{event.title}</h1>
        </div>

        <div className="detail-grid" style={{ gridTemplateColumns: '1fr 320px' }}>
          <div className="detail-content">
            {event.description && (
              <section className="card-white">
                <h2 className="section-title">About this event</h2>
                <p className="detail-text">{event.description}</p>
              </section>
            )}

            <section className="card-white">
              <h2 className="section-title">Event Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <span className="stub-label" style={{ display: 'block', marginBottom: 2 }}>Date & Time</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{formatEventDate(event.startDate, event.finishDate)}</span>
                </div>
                <div>
                  <span className="stub-label" style={{ display: 'block', marginBottom: 2 }}>Location</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{event.location}</span>
                </div>
                <div>
                  <span className="stub-label" style={{ display: 'block', marginBottom: 2 }}>Category</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{event.eventCategoryName || 'General'}</span>
                </div>
                <div>
                  <span className="stub-label" style={{ display: 'block', marginBottom: 2 }}>Organized by</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{event.organization}</span>
                </div>
              </div>
            </section>
          </div>

          <div className="detail-sidebar">
            <section className="card-white" style={{ position: 'sticky', top: 100 }}>
              {event.sections && event.sections.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>Sections & Pricing</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[...event.sections].sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0)).map((s) => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fafaf7', borderRadius: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: '#726f63' }}>{s.remainingCapacity ?? s.capacity} / {s.capacity} available</div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{Number(s.price) > 0 ? `${formatPrice(Number(s.price))}` : 'Free'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              <button
                className="btn btn-primary"
                style={{ width: '100%', border: 'none', cursor: 'pointer' }}
                onClick={() => {
                  navigate(`/events/${event.id}/reserve`)
                }}
              >
                Get Tickets
              </button>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1, border: 'none', cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(window.location.href)}>Copy link</button>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1, border: 'none', cursor: 'pointer' }} onClick={() => { if (navigator.share) navigator.share({ title: event.title, url: window.location.href }) }}>Share</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
