import { Link } from 'react-router-dom'
import { StatusBadge } from './StatusBadge'
import { formatDate, formatPrice } from '../utils/eventFormatters'
import type { EventCardResponse } from '../types/event.types'

interface Props {
  events: EventCardResponse[]
  loading?: boolean
}

export function EventTable({ events, loading }: Props) {
  if (loading) {
    return (
      <div>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="events-skeleton events-skeleton-row" style={{ height: 56, marginBottom: 8 }} />
        ))}
      </div>
    )
  }

  return (
    <div className="events-table-wrap">
      <table className="events-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Date</th>
            <th>Venue</th>
            <th>Price</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>
                <div className="events-table-event">
                  <div className="events-table-event-name">{event.title}</div>
                  {event.category && <div className="events-table-event-cat">{event.category}</div>}
                </div>
              </td>
              <td>{formatDate(event.startDate)}</td>
              <td>{event.venueName || 'TBD'}</td>
              <td>{event.priceFrom != null ? formatPrice(event.priceFrom, event.currency) : '-'}</td>
              <td><StatusBadge status={event.status as any} /></td>
              <td>
                <Link to={`/events/${event.id}`} className="events-table-action-link">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {events.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary, #726f63)' }}>No events found</div>
      )}
    </div>
  )
}
