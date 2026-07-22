import { useState } from 'react'

type OrgStatus = 'Pending' | 'Active' | 'Banned' | 'Suspended'

interface OrgRow {
  id: string
  name: string
  head: string
  email: string
  events: number
  status: OrgStatus
}

const MOCK_ORGS: OrgRow[] = [
  { id: 'org-1', name: 'Cairo Jazz Collective', head: 'Youssef Mansour', email: 'youssef@cairojazz.com', events: 8, status: 'Pending' },
  { id: 'org-2', name: 'Alexandria Arts Initiative', head: 'Laila Gamal', email: 'laila@alexarts.org', events: 3, status: 'Pending' },
  { id: 'org-3', name: 'Delta Music Festival', head: 'Karim Naguib', email: 'karim@deltamusic.com', events: 12, status: 'Pending' },
  { id: 'org-4', name: 'Cairo Events Co.', head: 'Ahmed Khalil', email: 'contact@cairoevents.com', events: 24, status: 'Active' },
  { id: 'org-5', name: 'Zamalek Theatre Group', head: 'Nadia Shokry', email: 'nadia@zamalektheatre.com', events: 6, status: 'Pending' },
  { id: 'org-6', name: 'New Cairo Family Fest', head: 'Hisham Lotfy', email: 'hisham@ncfest.com', events: 2, status: 'Banned' },
  { id: 'org-7', name: 'Grand Events Co.', head: 'Mona Salah', email: 'contact@grandevents.com', events: 15, status: 'Active' },
  { id: 'org-8', name: 'Stage Masters', head: 'Omar Kamel', email: 'info@stagemasters.com', events: 7, status: 'Active' },
]

const STATUS_BADGE: Record<string, string> = {
  Pending: 'badge badge-soft',
  Active: 'badge badge-yellow',
  Banned: 'badge badge-red',
  Suspended: 'badge badge-ink',
}

export default function OrganizationsManagement() {
  const [orgs, setOrgs] = useState(MOCK_ORGS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')

  const filtered = orgs.filter((o) => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All statuses' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalCount = orgs.length
  const pendingCount = orgs.filter((o) => o.status === 'Pending').length
  const bannedCount = orgs.filter((o) => o.status === 'Banned').length

  const updateStatus = (id: string, newStatus: OrgStatus) => {
    setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
  }

  const actionButtons = (org: OrgRow) => {
    switch (org.status) {
      case 'Pending':
        return (
          <div className="table-actions">
            <a href="#" className="action-link approve" onClick={(e) => { e.preventDefault(); updateStatus(org.id, 'Active') }}>Approve</a>
            <a href="#" className="action-link ban" onClick={(e) => { e.preventDefault(); updateStatus(org.id, 'Banned') }}>Reject</a>
          </div>
        )
      case 'Active':
        return (
          <div className="table-actions">
            <a href="#" className="action-link approve" onClick={(e) => { e.preventDefault(); updateStatus(org.id, 'Active') }}>Verify</a>
            <a href="#" className="action-link ban" onClick={(e) => { e.preventDefault(); updateStatus(org.id, 'Suspended') }}>Suspend</a>
          </div>
        )
      case 'Banned':
        return (
          <div className="table-actions">
            <a href="#" className="action-link approve" onClick={(e) => { e.preventDefault(); updateStatus(org.id, 'Active') }}>Reinstate</a>
            <a href="#" className="action-link ban" onClick={(e) => { e.preventDefault(); updateStatus(org.id, 'Banned') }}>Ban</a>
          </div>
        )
      case 'Suspended':
        return (
          <div className="table-actions">
            <a href="#" className="action-link approve" onClick={(e) => { e.preventDefault(); updateStatus(org.id, 'Active') }}>Reinstate</a>
            <a href="#" className="action-link ban" onClick={(e) => { e.preventDefault(); updateStatus(org.id, 'Banned') }}>Ban</a>
          </div>
        )
    }
  }

  return (
    <div className="wrap oversight-page" style={{ padding: '36px 0' }}>
      <div className="page-head">
        <div>
          <h1 className="section-title" style={{ margin: 0 }}>Organization Management</h1>
          <p className="section-sub" style={{ margin: '4px 0 0' }}>
            Review, approve, and manage all event organizer accounts.
          </p>
        </div>
        <div className="oversight-stats" style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <span className="stat-chip">{totalCount} Total</span>
          <span className="stat-chip pending-chip">{pendingCount} Pending</span>
          <span className="stat-chip flagged-chip">{bannedCount} Banned</span>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 24 }}>
        <input
          className="form-input"
          type="search"
          placeholder="Search organizations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 260 }}
        />
        <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All statuses</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Banned</option>
          <option>Suspended</option>
        </select>
      </div>

      <div className="card-white table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Head</th>
              <th>Email</th>
              <th>Events</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((org) => (
              <tr key={org.id}>
                <td><strong>{org.name}</strong></td>
                <td>{org.head}</td>
                <td>{org.email}</td>
                <td><span className="mono">{org.events}</span></td>
                <td><span className={STATUS_BADGE[org.status]}>{org.status}</span></td>
                <td className="action-cell">{actionButtons(org)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
                  No organizations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
