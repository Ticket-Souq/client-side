import { useState } from 'react'

interface Venue {
  id: string
  name: string
  organizer: string
  location: string
  capacity: string
  status: 'Active' | 'Pending' | 'Flagged' | 'Disabled'
  art: string
}

const MOCK_VENUES: Venue[] = [
  { id: 'v-1', name: 'Cairo Arena', organizer: 'Cairo Events Co.', location: 'New Cairo', capacity: '250', status: 'Active', art: 'art-waves' },
  { id: 'v-2', name: 'Nile Theatre', organizer: 'Downtown Productions', location: 'Downtown', capacity: '800', status: 'Pending', art: 'art-beams' },
  { id: 'v-3', name: 'Zamalek Hall', organizer: 'Zamalek Arts', location: 'Zamalek', capacity: '120', status: 'Flagged', art: 'art-waves' },
  { id: 'v-4', name: 'Maadi Stadium', organizer: 'Sheikh Zayed Sports', location: 'Maadi', capacity: '2,000', status: 'Active', art: 'art-grid' },
  { id: 'v-5', name: 'Giza Convention', organizer: 'Giza Events', location: 'Giza', capacity: '500', status: 'Pending', art: 'art-waves' },
  { id: 'v-6', name: 'New Capital Expo', organizer: 'New Cairo Events', location: 'New Capital', capacity: '3,000', status: 'Active', art: 'art-confetti' },
]

const STATUS_BADGE: Record<string, string> = {
  Active: 'badge badge-yellow',
  Pending: 'badge badge-soft',
  Flagged: 'badge badge-red',
  Disabled: 'badge badge-ink',
}

export default function VenueOversight() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [venues, setVenues] = useState(MOCK_VENUES)

  const filtered = venues.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.organizer.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || v.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalCount = venues.length
  const pendingCount = venues.filter((v) => v.status === 'Pending').length

  return (
    <div className="wrap oversight-page" style={{ padding: '36px 0' }}>
      <div className="page-head" style={{ marginBottom: 28 }}>
        <h1 className="section-title" style={{ margin: 0 }}>Venue Oversight</h1>
        <div className="oversight-stats" style={{ display: 'flex', gap: 12 }}>
          <span className="stat-chip">{totalCount} Total</span>
          <span className="stat-chip pending-chip">{pendingCount} Pending</span>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 24 }}>
        <input
          className="form-input"
          type="search"
          placeholder="Search venues by name or organizer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Flagged</option>
          <option>Disabled</option>
        </select>
      </div>

      <section className="row-section" style={{ paddingTop: 0 }}>
        <div className="hscroll">
          {filtered.map((venue) => (
            <div key={venue.id} className="ecard">
              <div className={`art ${venue.art}`}></div>
              <span className="corner mono">{venue.capacity}</span>
              <div className="overlay">
                <p className="ev-title">{venue.name}</p>
                <p className="ev-meta venue-meta">
                  <span>{venue.location}</span>
                  <span className={STATUS_BADGE[venue.status]}>{venue.status}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ paddingBottom: 52 }}>
        <div className="card-white table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Organizer</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((venue) => (
                <tr key={venue.id}>
                  <td><strong>{venue.name}</strong></td>
                  <td>{venue.organizer}</td>
                  <td>{venue.location}</td>
                  <td><span className="mono">{venue.capacity}</span></td>
                  <td><span className={STATUS_BADGE[venue.status]}>{venue.status}</span></td>
                  <td className="action-cell">
                    <a href="#" className="action-link verify" onClick={(e) => e.preventDefault()}>Verify</a>
                    <a href="#" className="action-link flag" onClick={(e) => e.preventDefault()}>Flag</a>
                    <a href="#" className="action-link disable" onClick={(e) => e.preventDefault()}>Disable</a>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
                    No venues found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
