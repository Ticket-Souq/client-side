import { useState } from 'react'

interface PendingOrg {
  id: string
  name: string
  head: string
  date: string
  status: string
}

interface RecentUser {
  name: string
  role: string
  art: string
}

const PENDING_ORGS: PendingOrg[] = [
  { id: 'org-1', name: 'Cairo Jazz Collective', head: 'Youssef Mansour', date: '18 Jul 2026', status: 'Pending' },
  { id: 'org-2', name: 'Alexandria Arts Initiative', head: 'Laila Gamal', date: '17 Jul 2026', status: 'Pending' },
  { id: 'org-3', name: 'Delta Music Festival', head: 'Karim Naguib', date: '16 Jul 2026', status: 'Pending' },
  { id: 'org-4', name: 'Zamalek Theatre Group', head: 'Nadia Shokry', date: '15 Jul 2026', status: 'Pending' },
  { id: 'org-5', name: 'New Cairo Family Fest', head: 'Hisham Lotfy', date: '14 Jul 2026', status: 'Pending' },
]

const RECENT_USERS: RecentUser[] = [
  { name: 'Mona Adel', role: 'Event Organizer', art: 'art-waves' },
  { name: 'Omar Khaled', role: 'Attendee', art: 'art-waves' },
  { name: 'Sara El-Din', role: 'Venue Manager', art: 'art-beams' },
  { name: 'Tamer Rashad', role: 'Event Organizer', art: 'art-confetti' },
  { name: 'Laila Hassan', role: 'Attendee', art: 'art-dots' },
  { name: 'Karim Youssef', role: 'Event Organizer', art: 'art-grid' },
]

export default function AdminDashboard() {
  const [orgs] = useState(PENDING_ORGS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')

  const filtered = orgs.filter((o) => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All statuses' || statusFilter === o.status
    return matchSearch && matchStatus
  })

  return (
    <div className="wrap" style={{ padding: '36px 0' }}>
      <section style={{ padding: '0 0 40px' }}>
        <div className="summary-card" style={{
          background: 'var(--ink)',
          borderRadius: 20,
          padding: '36px 40px',
          color: '#fff',
        }}>
          <p className="mono" style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', margin: '0 0 8px' }}>
            Admin Panel
          </p>
          <p className="display" style={{ fontSize: 48, lineHeight: 0.95, margin: '0 0 4px', color: 'var(--yellow)' }}>
            {orgs.length}
          </p>
          <p className="mono" style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Pending organization requests
          </p>
        </div>
      </section>

      <section className="row-section" style={{ paddingTop: 0 }}>
        <div className="row-head">
          <h2 className="row-title">Organization Requests</h2>
        </div>
        <div className="filter-bar" style={{ marginBottom: 24 }}>
          <input
            className="form-input"
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 260 }}
          />
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All statuses</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
        <div className="card-white table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Head</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr key={org.id}>
                  <td><strong>{org.name}</strong></td>
                  <td>{org.head}</td>
                  <td>{org.date}</td>
                  <td><span className="badge badge-soft">{org.status}</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-primary btn-sm">Approve</button>
                      <button className="btn btn-danger btn-sm">Ban</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
                    No matching organizations
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="row-section" style={{ paddingTop: 0 }}>
        <div className="row-head">
          <h2 className="row-title">Recent Users</h2>
          <a href="/admin/users" className="row-seeall">View all &rarr;</a>
        </div>
        <div className="hscroll">
          {RECENT_USERS.map((user, i) => (
            <div key={i} className="ecard user-ecard">
              <div className={`art ${user.art}`}></div>
              <div className="overlay">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
