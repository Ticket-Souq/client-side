import { useState } from 'react'
import './TeamManagement.css'

interface Member {
  id: string
  name: string
  email: string
  role: string
  roleBadge: string
  status: string
  statusBadge: string
  active: boolean
}

const ALL_MEMBERS: Member[] = [
  { id: '01', name: 'Karim Mansour', email: 'karim@cairoevents.com', role: 'Agent', roleBadge: 'badge-yellow', status: 'Active', statusBadge: 'badge-green', active: true },
  { id: '02', name: 'Nadia Salem', email: 'nadia@cairoevents.com', role: 'Agent', roleBadge: 'badge-yellow', status: 'Active', statusBadge: 'badge-green', active: true },
  { id: '03', name: 'Omar Hisham', email: 'omar.h@cairoevents.com', role: 'Consumer', roleBadge: 'badge-soft', status: 'Active', statusBadge: 'badge-green', active: true },
  { id: '04', name: 'Laila Youssef', email: 'laila@cairoevents.com', role: 'Agent', roleBadge: 'badge-yellow', status: 'Inactive', statusBadge: 'badge-red', active: false },
  { id: '05', name: 'Mariam Lotfy', email: 'mariam@cairoevents.com', role: 'Consumer', roleBadge: 'badge-soft', status: 'Active', statusBadge: 'badge-green', active: true },
  { id: '06', name: 'Amr El-Gammal', email: 'amr.g@cairoevents.com', role: 'Agent', roleBadge: 'badge-yellow', status: 'Inactive', statusBadge: 'badge-red', active: false },
  { id: '07', name: 'Dina El-Sayed', email: 'dina@cairoevents.com', role: 'Consumer', roleBadge: 'badge-soft', status: 'Active', statusBadge: 'badge-green', active: true },
]

const TABS = ['All', 'Agents', 'Consumers']

export default function TeamManagement() {
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [credsOpen, setCredsOpen] = useState(false)
  const [members, setMembers] = useState(ALL_MEMBERS)

  const filtered = members.filter((m) => {
    const matchTab = tab === 'All' || m.role === tab.slice(0, -1)
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const toggleActive = (id: string) => {
    setMembers(members.map((m) => m.id === id ? { ...m, active: !m.active, status: !m.active ? 'Active' : 'Inactive', statusBadge: !m.active ? 'badge-green' : 'badge-red' } : m))
  }

  return (
    <main className="wrap members-page">
      <div className="members-head">
        <h1 className="members-title">Organization Members</h1>
        <a href="/org/organization" className="members-back">&larr; Back to organization</a>
      </div>

      <div className="search-bar">
        <input type="text" className="form-input" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <a href="#" className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>Search</a>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="card-white" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Credentials</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td className="mono">{m.id}</td>
                  <td>{m.name}</td>
                  <td>{m.email}</td>
                  <td><span className={`badge ${m.roleBadge}`}>{m.role}</span></td>
                  <td><span className={`badge ${m.statusBadge}`}>{m.status}</span></td>
                  <td><a href="#" className="text-link" onClick={(e) => { e.preventDefault(); setCredsOpen(!credsOpen) }}>View</a></td>
                  <td>
                    <label className={`toggle ${m.active ? 'active' : ''}`} onClick={() => toggleActive(m.id)}>
                      <span className="toggle-track"></span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <details className="card-white creds-card" open={credsOpen} onToggle={(e) => setCredsOpen((e.target as HTMLDetailsElement).open)}>
        <summary>View generated credentials</summary>
        <div className="creds-row">
          <div className="creds-field">
            <span className="creds-label">Username</span>
            <span className="creds-value">karim.mansour_org</span>
          </div>
          <div className="creds-field">
            <span className="creds-label">Password</span>
            <span className="creds-value" style={{ letterSpacing: '0.15em' }}>&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span>
          </div>
          <div className="creds-field">
            <span className="creds-label">Role</span>
            <span className="creds-value" style={{ fontFamily: "'Inter',sans-serif" }}>Agent</span>
          </div>
          <a href="#" className="text-link" style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Copy</a>
        </div>
      </details>
    </main>
  )
}
