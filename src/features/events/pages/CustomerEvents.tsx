import { useNavigate } from 'react-router-dom'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { EmptyState } from '../components/EmptyState'
import { useEvents } from '../hooks/useEvents'
import { useEventSearch } from '../hooks/useEventSearch'
import { formatDate } from '../utils/eventFormatters'
import { CATEGORIES } from '../constants/categories'

const ART_CLASSES = ['art-beams', 'art-waves', 'art-confetti', 'art-grid', 'art-waves', 'art-waves']
const DATE_OPTIONS = [
  { value: 'all', label: 'All dates' },
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
  { value: 'next_month', label: 'Next month' },
]

function artClass(i: number) { return ART_CLASSES[i % ART_CLASSES.length] }

export default function CustomerEvents() {
  const navigate = useNavigate()
  const { events, loading } = useEvents({ page: 0, size: 20 })
  const { results: searchResults, loading: searching, query, setQuery, clear } = useEventSearch()

  const displayEvents = query ? searchResults : events
  const featured = events[0]

  return (
    <main className="wrap">
      <section className="page-head discover-head">
        <div>
          <h1 className="page-title display">Discover Events</h1>
          <p className="section-sub" style={{ margin: '4px 0 0' }}>Find events, book tickets, and enjoy experiences across Egypt</p>
        </div>
      </section>

      <div className="filter-bar">
        <input className="form-input" type="search" placeholder="Search events by name, venue…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="form-select">
          <option>All categories</option>
          {CATEGORIES.map((cat) => (<option key={cat}>{cat}</option>))}
        </select>
        <select className="form-select">
          {DATE_OPTIONS.map((opt) => (<option key={opt.value}>{opt.label}</option>))}
        </select>
      </div>

      {loading && <LoadingSkeleton variant="card" count={6} />}

      {!loading && !query && featured && (
        <>
          <a
            href={`/events/${featured.id}`}
            className="featured-event"
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            onClick={(e) => { e.preventDefault(); navigate(`/events/${featured.id}`) }}
          >
            <div className="feat-art">
              <div className="feat-content">
                <span className="feat-tag">Featured</span>
                <h2 className="feat-title">{featured.title}</h2>
                <p className="feat-meta">{formatDate(featured.startDate)} · {featured.venueName || 'TBD'}</p>
                <p className="feat-desc">Don't miss this incredible event.</p>
                <span className="btn btn-primary">Get Tickets</span>
              </div>
            </div>
          </a>

          <section className="row-section">
            <div className="row-head">
              <h2 className="row-title">All Events</h2>
              <a href="/events" className="row-seeall" onClick={(e) => { e.preventDefault() }}>See all &rarr;</a>
            </div>
            <div className="event-grid">
              {events.map((event, i) => (
                <div key={event.id} className="event-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${event.id}`)}>
                  <div className={`art ${artClass(i)}`} style={{ height: 120, borderRadius: 'var(--radius) var(--radius) 0 0' }} />
                  <div className="event-card-body">
                    <span className="badge badge-ink mono">{event.category || 'Event'}</span>
                    <h3 className="event-card-title">{event.title}</h3>
                    <p className="event-card-meta">{formatDate(event.startDate)} · {event.venueName || 'TBD'}</p>
                    <p className="event-card-price">{event.priceFrom != null ? `From EGP ${event.priceFrom}` : 'Free'}</p>
                    <span className="btn btn-primary btn-sm" style={{ width: '100%' }}>View Details</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {!loading && !query && !featured && (
        <div className="events-empty">
          <div className="events-empty-icon">🎵</div>
          <div className="events-empty-title">No events yet</div>
          <div className="events-empty-desc">Check back soon for upcoming events.</div>
        </div>
      )}

      {!loading && query && searchResults.length === 0 && (
        <div className="events-empty">
          <div className="events-empty-icon">🔍</div>
          <div className="events-empty-title">No events found</div>
          <div className="events-empty-desc">No events match "{query}". Try a different search.</div>
          <button className="btn btn-ghost" style={{ border: 'none', cursor: 'pointer' }} onClick={clear}>Clear search</button>
        </div>
      )}

      {!loading && query && searchResults.length > 0 && (
        <section className="row-section" style={{ paddingTop: query ? 0 : undefined }}>
          <div className="row-head">
            <h2 className="row-title">Search results</h2>
            <button onClick={clear} className="row-seeall" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>Clear</button>
          </div>
          <div className="event-grid" style={{ marginTop: 24 }}>
            {searchResults.map((event, i) => (
              <div key={event.id} className="event-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${event.id}`)}>
                <div className={`art ${artClass(i)}`} style={{ height: 120, borderRadius: 'var(--radius) var(--radius) 0 0' }} />
                <div className="event-card-body">
                  <span className="badge badge-ink mono">{event.category || 'Event'}</span>
                  <h3 className="event-card-title">{event.title}</h3>
                  <p className="event-card-meta">{formatDate(event.startDate)} · {event.venueName || 'TBD'}</p>
                  <p className="event-card-price">{event.priceFrom != null ? `From EGP ${event.priceFrom}` : 'Free'}</p>
                  <span className="btn btn-primary btn-sm" style={{ width: '100%' }}>View Details</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
