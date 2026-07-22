import { Button } from '../../../shared/components/form/Button/Button'
import { StatusBadge } from './StatusBadge'
import { formatDate, formatPrice } from '../utils/eventFormatters'
import type { EventDetail } from '../types/event.types'

interface Props {
  event: EventDetail
  onBack?: () => void
  onBook?: () => void
}

export function EventDetailGrid({ event, onBack, onBook }: Props) {
  return (
    <div className="events-detail-grid">
      <div className="events-detail-content">
        {event.imageUrl && (
          <div style={{ borderRadius: 'var(--radius, 14px)', overflow: 'hidden', maxHeight: 400 }}>
            <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="events-page-title">{event.title}</h1>
            <StatusBadge status={event.status} />
          </div>

          <div className="events-detail-grid-2col" style={{ marginTop: 18 }}>
            <div>
              <div className="events-detail-label">Date</div>
              <div className="events-detail-value">{formatDate(event.startDate)}</div>
            </div>
            {event.endDate && (
              <div>
                <div className="events-detail-label">End Date</div>
                <div className="events-detail-value">{formatDate(event.endDate)}</div>
              </div>
            )}
            <div>
              <div className="events-detail-label">Location</div>
              <div className="events-detail-value">{event.venueName || 'TBD'}</div>
            </div>
            {event.venueAddress && (
              <div>
                <div className="events-detail-label">Address</div>
                <div className="events-detail-value">{event.venueAddress}</div>
              </div>
            )}
            {event.category && (
              <div>
                <div className="events-detail-label">Category</div>
                <div className="events-detail-value">{event.category}</div>
              </div>
            )}
            <div>
              <div className="events-detail-label">Mode</div>
              <div className="events-detail-value">{event.mode === 'ZONE_BASED' ? 'Zone-based' : 'Seat-based'}</div>
            </div>
          </div>
        </div>

        {event.description && (
          <div>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 12 }}>About this event</h3>
            <p className="events-detail-text">{event.description}</p>
          </div>
        )}

        {event.tags && event.tags.length > 0 && (
          <div className="events-tags-row">
            {event.tags.map((tag) => (
              <span key={tag} className="events-stat-chip">{tag}</span>
            ))}
          </div>
        )}

        {event.tiers && event.tiers.length > 0 && (
          <div>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Ticket Tiers</h3>
            {event.tiers.map((tier) => (
              <div key={tier.id} className="events-tier-card">
                <div className="events-tier-head">
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600 }}>{tier.name}</div>
                  <div className="events-tier-price">{formatPrice(tier.price, 'EGP')}</div>
                </div>
                {tier.perks && tier.perks.length > 0 && (
                  <ul className="events-tier-perks">
                    {tier.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                )}
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--text-secondary, #726f63)' }}>
                  {tier.available} / {tier.total} available
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="events-detail-sidebar">
        <div style={{ border: '1px solid var(--border, #eae7dc)', borderRadius: 'var(--radius, 14px)', padding: 24 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{event.title}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--text-secondary, #726f63)', marginBottom: 16 }}>{event.venueName || 'TBD'}</div>
          {event.priceFrom != null && (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 600, marginBottom: 18 }}>{formatPrice(event.priceFrom, event.currency)}</div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            {onBack && (
              <Button variant="ghost" onClick={onBack} style={{ flex: 1 }}>Back</Button>
            )}
            {onBook && event.status === 'PUBLISHED' && (
              <Button variant="primary" onClick={onBook} style={{ flex: 1 }}>Book tickets</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
